const { ObjectId } = require("mongodb");
const fs = require('fs').promises;
const moment = require('moment');

class BorrowService {
    constructor(client) {
        this.Borrow = client.db().collection("borrows");
    }
    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
    extractBorrowData(payload) {
        const borrow = {
            user_id: ObjectId.isValid(payload.user_id) ? new ObjectId(payload.user_id) : null,
            books: payload.checkoutInfoOfUser.map(book => ({
                book_id: ObjectId.isValid(book.book_id) ? new ObjectId(book.book_id) : null,
                quantity: parseInt(book.quantity),
                return_number: parseInt(payload.return_number) || 0,
                total_price: parseInt(book.total_price),
            })),
            totalPrice: payload.totalPrice,
            status: 'Đang chờ xác nhận',
            borrow_date: null,
            duration: null,
            return_date: null,
        };

        // Remove undefined fields
        Object.keys(borrow).forEach(
            (key) => borrow[key] === undefined && delete borrow[key]
        );
        return borrow;
    }

    // create
    async create(payload) {
        const borrow = this.extractBorrowData(payload);
        const result = await this.Borrow.insertOne(borrow);
        return result.value;
    }

    // find
    async find(filter) {
        const cursor = await this.Borrow.find(filter);
        return await cursor.toArray();
    }

    // findByName
    async findByName(name) {
        return await this.find({
            name: { $regex: new RegExp(name), $options: "i" },
        });
    }

    // findById
    async findById(id) {
        return await this.Borrow.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    // update
    async update(cartId, updatedCart) {
        const filter = {
            _id: ObjectId.isValid(cartId) ? new ObjectId(cartId) : null,
        };
        const update = { $set: { books: updatedCart.books } };

        const result = await this.Cart.findOneAndUpdate(
            filter,
            update,
            { returnDocument: "after" }
        );

        return result;
    }

    //update Status
    async updateStatus(id, status) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        if (status == 'Đang mượn') {
            const borrowRecord = await this.Borrow.findOne(filter);
            borrowRecord.status = status;
            // Lấy ngày mượn
            const borrowDate = moment().format('DD-MM-YYYY HH:mm');
            borrowRecord.borrow_date = borrowDate;

            // Tính toán ngày trả: ngày mượn + 14 ngày
            const duration = moment().add(14, 'days').format('DD-MM-YYYY HH:mm');
            borrowRecord.duration = duration;
            await this.Borrow.updateOne(
                filter,
                {
                    $set:
                    {
                        status: borrowRecord.status,
                        borrow_date: borrowRecord.borrow_date,
                        duration: borrowRecord.duration,
                    }
                }
            );
            return borrowRecord;
        } else if (status == 'Yêu cầu hủy' || status == 'Đã hủy') {
            const borrowRecord = await this.Borrow.findOne(filter);
            borrowRecord.status = status;
            await this.Borrow.updateOne(
                filter,
                {
                    $set:
                    {
                        status: borrowRecord.status,
                    }
                }
            );
            return borrowRecord;
        }
    }


    // delete
    async delete(id) {
        const result = await this.Borrow.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result;
    }

    async findActiveBorrowByUserId(userId) {
        try {
            const activeBorrow = await this.Borrow.findOne({ user_id: new ObjectId(userId), status: "Đang mượn" });
            return activeBorrow;
        } catch (error) {
            throw new Error("Error finding active borrow by user ID");
        }
    }

    async deleteWithUserId(id) {
        const result = await this.Borrow.deleteMany({
            user_id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result;
    }

    async deleteProductFromCart(userId, bookId) {
        try {
            const userCart = await this.Cart.findOne({ user_id: new ObjectId(userId) });

            // Nếu không tìm thấy giỏ hàng hoặc giỏ hàng không chứa sản phẩm có bookId tương ứng
            if (!userCart || !userCart.books.some(book => book.book_id.toString() === bookId)) {
                return null;
            }

            userCart.books = userCart.books.filter(book => book.book_id.toString() !== bookId);

            await this.Cart.updateOne({ _id: userCart._id }, { $set: { books: userCart.books } });

            return userCart;
        } catch (error) {
            throw new Error(`Could not delete product from cart: ${error.message}`);
        }
    }


    // findFavorite
    async findFavorite() {
        return await this.find({ favorite: true });
    }

    // deleteAll
    async deleteAll() {
        const result = await this.Borrow.deleteMany({});
        return result.deletedCount;
    }

    async deleteAllProducts(userId) {
        try {
            const filter = { user_id: new ObjectId(userId) };
            const update = { $set: { books: [] } };
            await this.Borrow.updateOne(filter, update);
        } catch (error) {
            throw new Error(`Could not delete all products from borrow: ${error.message}`);
        }
    }

    async updateReturnNumber(bookId, borrowId, returnNumber) {
        try {
            // câp nhật ngày trả và sô lượng đã trả
            const today = moment().format('DD-MM-YYYY HH:mm');
            const result = await this.Borrow.updateOne(
                { _id: new ObjectId(borrowId), "books.book_id": new ObjectId(bookId) },
                { $set: { "books.$.return_number": returnNumber, return_date: today } }
            );

            // Kiểm tra xem số lượng đã trả đủ chưa
            const borrow = await this.Borrow.findOne({ _id: new ObjectId(borrowId) });
            // Tính tổng số lượng sách mượn
            const totalQuantityBorrowed = borrow.books.reduce((total, book) => total + parseInt(book.quantity), 0);
            // Tính tổng số lượng sách đã trả
            const totalReturned = borrow.books.reduce((total, book) => total + parseInt(book.return_number), 0);
            if (totalReturned == totalQuantityBorrowed) {
                await this.Borrow.updateOne({ _id: new ObjectId(borrowId) }, { $set: { status: 'Đã trả' } });
            }

            return result;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

}
module.exports = BorrowService;
