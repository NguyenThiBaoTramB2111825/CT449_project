const { ObjectId } = require("mongodb");
const fs = require('fs').promises;

class PublisherService {
  constructor(client) {
    this.Publisher = client.db().collection("nxbs");
  }
  // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
  extractPublisherData(payload) {
    const publisher = {
      publisher_name: payload.publisher_name,
      publisher_address: payload.publisher_address,
    };
    // Remove undefined fields
    Object.keys(publisher).forEach(
      (key) => publisher[key] === undefined && delete publisher[key]
    );
    return publisher;
  }

  // create
  async create(payload) {
    const publisher = this.extractPublisherData(payload);
    const result = await this.Publisher.insertOne(publisher);
    return result.value;
  }

  async getPublisherInfoById(publisherId) {
    return await this.Publisher.findOne({
      _id: ObjectId.isValid(publisherId) ? new ObjectId(publisherId) : null,
    });
  }

  // find
  async find(filter) {
    const cursor = await this.Publisher.find(filter);
    return await cursor.toArray();
  }

  // findByName
  async findByName(publisher_name) {
    return await this.find({
      publisher_name: { $regex: new RegExp(publisher_name), $options: "i" },
    });
  }

  // findById
  async findById(id) {
    return await this.Publisher.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  // update
  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = this.extractPublisherData(payload);

    const result = await this.Publisher.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );

    return result;
  }

  // delete
  async delete(id) {
    const result = await this.Publisher.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  // deleteAll
  async deleteAll() {
    const result = await this.Publisher.deleteMany({});
    return result.deletedCount;
  }
}
module.exports = PublisherService;
