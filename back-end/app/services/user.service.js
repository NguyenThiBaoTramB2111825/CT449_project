const { ObjectId } = require("mongodb");
const bcrypt = require('bcrypt');

class UserService {
    constructor(client) {
        this.User = client.db().collection("users");
    }
    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
    extractUserData(payload) {
        const user = {
            user_name: payload.user_name,
            user_gender: payload.user_gender,
            user_phone: payload.user_phone,
            user_password: payload.user_password,
            user_address: payload.user_address || null,
            user_role: payload.user_role || 'user' 
        };
        // Remove undefined fields
        Object.keys(user).forEach(
            (key) => user[key] === undefined && delete user[key]
        );
        return user;
    }

    // create
    async create(payload) {
        const user = this.extractUserData(payload);
        const result = await this.User.insertOne(user);
        return result.value;
    }

    // auth
    async authenticateUser(payload) {
        const userData = this.extractUserData(payload);
        const user = await this.User.findOne({ user_name: userData.user_name });
        if (!user) {
            throw new Error('Không tìm thấy người dùng'); 
        }
        const isPasswordValid = await bcrypt.compare(userData.user_password, user.user_password);
        if (isPasswordValid) {
            return user;
        } else {
            throw new Error('Mật khẩu không đúng');
        }
    }

    // find
    async find(filter) {
        const cursor = await this.User.find(filter);
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
        return await this.User.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    // update
    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractUserData(payload);

        const result = await this.User.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" } 
        );

        return result;
    }

    // delete
    async delete(id) {
        const result = await this.User.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result;
    }

    // deleteAll
    async deleteAll() {
        const result = await this.User.deleteMany({});
        return result.deletedCount;
    }

    async findOneUserByName (username) {
        try {
            const user = await this.User.findOne({ user_name: username });
            return user; 
        } catch (error) {
            console.error('Error finding user by name:', error);
            throw error;
        }
    };
    
    async findOneUserByPhone (phone) {
        try {
            const user = await this.User.findOne({ user_phone: phone });
            return user; 
        } catch (error) {
            console.error('Error finding user by phone number:', error);
            throw error;
        }
    };
    
}
module.exports = UserService;
