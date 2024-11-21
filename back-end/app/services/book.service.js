const { ObjectId } = require("mongodb");
const fs = require('fs').promises;

class BookService {
  constructor(client) {
    this.Book = client.db().collection("books");
  }
  // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
  extractBookData(payload) {
    const book = {
      book_name: payload.book_name,
      book_description: payload.book_description,
      book_number: parseInt(payload.book_number),
      book_price: parseInt(payload.book_price),
      book_image: payload.imagePath,
      publisher_id: ObjectId.isValid(payload.publisher_id)
        ? new ObjectId(payload.publisher_id)
        : null,
      publisher_year: parseInt(payload.publisher_year),
      book_borrowedNumber: parseInt(payload.book_borrowedNumber) || 0,
    };

    // Remove undefined fields
    Object.keys(book).forEach(
      (key) => book[key] === undefined && delete book[key]
    );
    return book;
  }

  // create
  async create(payload) {
    const book = this.extractBookData(payload);
    const result = await this.Book.insertOne(book);
    return result.value;
  }

  // find
  async find(filter) {
    const cursor = await this.Book.find(filter);
    return await cursor.toArray();
  }

  // findByName
  async findByName(book_name) {
    return await this.find({
      book_name: { $regex: new RegExp(book_name), $options: "i" },
    });
  }

  // findById
  async findById(id) {
    return await this.Book.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  // update
  async update(bookId, payload) {
    const filter = {
      _id: ObjectId.isValid(bookId) ? new ObjectId(bookId) : null,
    };
    const update = this.extractBookData(payload);

    const result = await this.Book.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );

    return result;
  }

  // delete
  async delete(id) {
    const result = await this.Book.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  // findFavorite
  async findFavorite() {
    return await this.find({ favorite: true });
  }

  // deleteAll
  async deleteAll() {
    const result = await this.Book.deleteMany({});
    return result.deletedCount;
  }

  // xóa sách theo pubisher_id khi xóa thể loại
  async deleteBookByPublisherId(publisherId) {
    const result = await this.Book.deleteMany({ publisher_id: new ObjectId(publisherId) });
    return result.deletedCount;
  }

  async findRandomBooks(size) {
    try {
      const totalBooksCount = await this.Book.countDocuments();
      const randomSkip = Math.floor(Math.random() * (totalBooksCount - size));

      const randomBooks = await this.Book.aggregate([
        { $match: {} },
        { $skip: randomSkip },
        { $sample: { size } },
      ]).toArray();

      return randomBooks;
    } catch (error) {
      throw new Error("Error while fetching random books");
    }
  }

  async updateBorrowedNumber(bookId, borrowedQuantity) {
    try {
      // Tìm và cập nhật số lượng mượn cho sách cụ thể
      const updatedBook = await this.Book.findOneAndUpdate(
        { _id: bookId },
        { $inc: { book_borrowedNumber: borrowedQuantity } }, // Tăng số lượng mượn
        { new: true } // Trả về bản ghi sau khi cập nhật
      );

      return updatedBook;
    } catch (error) {
      throw new Error(`Không thể cập nhật số lượng mượn cho sách: ${error.message}`);
    }
  };
}

module.exports = BookService;
