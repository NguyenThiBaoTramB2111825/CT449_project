const { ObjectId } = require("mongodb");

class CheckoutService {
    constructor(client) {
        this.Checkout = client.db().collection("checkouts");
    }
    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
    extractCheckOutData(payload) {
        const checkout = {
            user_id: ObjectId.isValid(payload.user_id)
                ? new ObjectId(payload.user_id)
                : null,
            selectedBooks: payload.selectedBooks.map(book => ({
                book_id: ObjectId.isValid(book.book_id) ? new ObjectId(book.book_id) : null,
                quantity: book.quantity,
                total_price: book.total_price
            }))
        };
        // Remove undefined fields
        Object.keys(checkout).forEach(
            (key) => checkout[key] === undefined && delete checkout[key]
        );
        return checkout;
    }

    // create
    async create(payload) {
        const checkout = this.extractCheckOutData(payload);
        const result = await this.Checkout.insertOne(checkout);
        return result.value;
    }

    // find
    async find(filter) {
        const cursor = await this.Checkout.find(filter);
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
        return await this.Checkout.findOne({
            user_id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    // update
    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractCheckOutData(payload);

        const result = await this.Checkout.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );

        return result;
    }

    // delete
    async delete(id) {
        const result = await this.Checkout.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result;
    }

    async deleteCheckOut(id) {
        const result = await this.Checkout.findOneAndDelete({
            user_id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result;
    }

    // findFavorite
    async findFavorite() {
        return await this.find({ favorite: true });
    }

    // deleteAll
    async deleteAll() {
        const result = await this.Checkout.deleteMany({});
        return result.deletedCount;
    }
}
module.exports = CheckoutService;
