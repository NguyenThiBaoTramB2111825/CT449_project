const { ObjectId } = require("mongodb");
const fs = require('fs').promises;
const bcrypt = require('bcrypt');

class adminService {
    constructor(client) {
        this.Admin = client.db().collection("admins");
    }
    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
    extractAdminData(payload) {
        const admin = {
            admin_name: payload.admin_name,
            admin_pass: payload.admin_pass,
            admin_role: payload.admin_role || 'admin',
        };
        // Remove undefined fields
        Object.keys(admin).forEach(
            (key) => admin[key] === undefined && delete admin[key]
        );
        return admin;
    }

    // create
    async create(payload) {
        const admin = this.extractAdminData(payload);
        const result = await this.Admin.insertOne(admin);
        return result.value;
    }

    //auth
    async authenticate(payload) {
        const adminData = this.extractAdminData(payload);
        const admin = await this.Admin.findOne({ admin_name: adminData.admin_name });
        // const isPasswordValid = await bcrypt.compare(adminData.admin_pass, admin.admin_pass);
        const isPasswordValid = adminData.admin_pass === admin.admin_pass;
        if (isPasswordValid) {
            return admin;
        } else {
            throw new Error('Mật khẩu không đúng');
        }
    }

    // find
    async find(filter) {
        const cursor = await this.Admin.find(filter);
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
        return await this.Admin.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    // update
    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractAdminData(payload);

        const result = await this.Admin.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );

        return result;
    }

    // delete
    async delete(id) {
        const result = await this.Admin.findOneAndDelete({
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
        const result = await this.Admin.deleteMany({});
        return result.deletedCount;
    }
}
module.exports = adminService;
