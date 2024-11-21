const { ObjectId } = require("mongodb");
const fs = require('fs').promises;

class CartService {
    constructor(client) {
        this.Cart = client.db().collection("carts");
    }
    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
    extractCartData(payload) {
        const cart = {
            user_id: ObjectId.isValid(payload.user_id) ? new ObjectId(payload.user_id) : null,
            books: [{
                book_id: ObjectId.isValid(payload.book_id) ? new ObjectId(payload.book_id) : null,
                quantity: payload.quantity || 1,
            }],

        };

        // Remove undefined fields
        Object.keys(cart).forEach(
            (key) => cart[key] === undefined && delete cart[key]
        );
        return cart;
    }

    // create
    async create(payload) {
        const cart = this.extractCartData(payload);
        const result = await this.Cart.insertOne(cart);
        return result.value;
    }

    // find
    async find(filter) {
        const cursor = await this.Cart.find(filter);
        return await cursor.toArray();
    }

    // findByName
    async findByName(name) {
        return await this.find({
            name: { $regex: new RegExp(name), $options: "i" },
        });
    }

    // findById
    async findByUserId(id) {
        return await this.Cart.findOne({
            user_id: ObjectId.isValid(id) ? new ObjectId(id) : null,
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

    async removeFromCart(user_id, book_id) {
        try {
            const result = await this.Cart.updateOne(
                { user_id: new ObjectId(user_id) },
                { $pull: { 
                    books: { 
                        book_id: new ObjectId(book_id) 
                    } 
                } }
            );
            return result;
        } catch (error) {
            throw error;
        }
    }

    async reduceQuantity(user_id, book_id, reduceAmount) {
        const result = await this.Cart.updateOne(
            { user_id: new ObjectId(user_id), "books.book_id": new ObjectId(book_id) },
            { $inc: { "books.$.quantity": -reduceAmount } } 
        );
        return result;
    }


    // delete
    async delete(id) {
        const result = await this.Cart.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
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


    // deleteAll
    async deleteAll() {
        const result = await this.Cart.deleteMany({});
        return result.deletedCount;
    }

    async deleteAllProducts(userId) {
        try {
            const filter = { user_id: new ObjectId(userId) };
            const update = { $set: { books: [] } };
            await this.Cart.updateOne(filter, update);
        } catch (error) {
            throw new Error(`Could not delete all products from cart: ${error.message}`);
        }
    }

}
module.exports = CartService;
