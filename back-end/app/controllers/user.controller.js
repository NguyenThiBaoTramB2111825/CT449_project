const ApiError = require("../api-error");
const MongoDB = require("../utils/mongodb.util");
const UserService = require("../services/user.service");
const bcrypt = require('bcrypt');
const BorrowService = require("../services/borrow.service");
const jwt = require('jsonwebtoken');

exports.create = async (req, res, next) => {
    if (!req.body?.user_name) {
        return next(new ApiError(400, "Name can not be empty"));
    }

    try {
        const userService = new UserService(MongoDB.client);
        const existingUserByName = await userService.findOneUserByName(req.body.user_name);
        if (existingUserByName) {
            return next(new ApiError(400, `Tồn tại người dùng có tên ${req.body.user_name}`));
        }
        const existingUser = await userService.findOneUserByPhone(req.body.user_phone);
        if (existingUser) {
            return next(new ApiError(400, 'Số điện thoại này đã được sử dụng'));
        }
        const hashedPassword = await bcrypt.hash(req.body.user_password, 10);

        const user = {
            user_name: req.body.user_name,
            user_phone: req.body.user_phone,
            user_gender: req.body.user_gender,
            user_password: hashedPassword,
        };

        const document = await userService.create(user);
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, "An Error Occurred while creating the book"));
    }
};

exports.loginUser = async (req, res, next) => {
    if (!req.body?.user_name || !req.body?.user_password) {
        return next(new ApiError(400, "Tên người dùng và mật khẩu không được để trống"));
    }

    try {
        const userService = new UserService(MongoDB.client);
        const user = await userService.authenticateUser(req.body);
        const accessToken = jwt.sign({ user_id: user._id }, 'my_secret_key', { expiresIn: 24 * 60 * 60 });
        return res.json({
            message: 'Thanh cong',
            accessToken: accessToken,
            // user_name: user.user_name,
        });
    } catch (error) {
        const errorMessage = error.message || "Có lỗi xảy ra";
        return next(new ApiError(401, errorMessage));
    }
};


exports.findALL = async (req, res, next) => {
    let documents = [];

    try {
        const userService = new UserService(MongoDB.client);
        const { user_name } = req.query;
        if (user_name) {
            documents = await userService.findByName(user_name);
        } else {
            documents = await userService.find({});
        }
    } catch (error) {
        return next(
            new ApiError(500, "An Error Occurred while retrieving users")
        );
    }

    return res.send(documents);
};

exports.findOne = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const document = await userService.findById(req.user.user_id);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy người dùng"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, "An Error Occurred while retrieving user")
        );
    };
};

exports.update = async (req, res, next) => {
    try {
        const user_id = req.user.user_id;
        const userService = new UserService(MongoDB.client);
        const document = await userService.update(user_id, req.body);
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, "An Error Occurred while processing the request"));
    }
};

exports.delete = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const borrowService = new BorrowService(MongoDB.client);
        const activeBorrow = await borrowService.findActiveBorrowByUserId(req.params.id);
        if (activeBorrow) {
            // Kiểm tra user có đang mượn không, nếu đang mượn không thể xóa
            return next(
                new ApiError(400, 'Người dùng có đơn mượn đang mượn, không thể xóa.')
            );
        }
        const document = await userService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "user not found"));
        }
        await borrowService.deleteWithUserId(req.params.id);
        return res.send({ messgae: "user was deleted successfully" });
    } catch (error) {
        return next(
            new ApiError(500, `Could not delete user with id=${req.params.id}`)
        );
    }
};

exports.deleteALL = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const deletedCount = await userService.deleteAll();
        return res.send({
            message: `${deletedCount} users were deleted successfully`,
        });
    } catch (error) {
        return next(
            new ApiError(500, "An Error Occurred while removing all users")
        );
    }
};
