const ApiError = require("../api-error");
const MongoDB = require("../utils/mongodb.util");
const CartService = require("../services/cart.service");
const BookService = require("../services/book.service");
const PublisherService = require("../services/publisher.service");
const { ObjectId } = require("mongodb");
const UserService = require("../services/user.service");
const jwt = require('jsonwebtoken');

exports.addtocart = async (req, res, next) => {
    try {
        const cartService = new CartService(MongoDB.client);
        const userService = new UserService(MongoDB.client);

        // const user_id = new ObjectId(req.body.user_id);
        const book_id = new ObjectId(req.body.book_id);
        const quantity = req.body.quantity;
        const user_id = new ObjectId(req.user.user_id); // Lấy user_id từ JWT đã được giải mã

        const userInfo = await userService.findById(user_id);
        if (!userInfo) {
            return next(new ApiError(404, "Không tìm thấy người dùng"));
        }
        let cart = await cartService.find({ user_id });
        if (!cart || cart.length == 0) {
            const newCartData = { ...req.body, user_id: req.user.user_id };
            cart = await cartService.create(newCartData);
        } else {
            const existingBook = cart[0].books.find(book => book.book_id.equals(book_id));
            if (existingBook) {
                existingBook.quantity += quantity;
            } else {
                cart[0].books.push({ book_id, quantity });
            }
            cart = await cartService.update(cart[0]._id, { books: cart[0].books });
        }

        res.status(200).json(cart);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Không thể thêm vào giỏ hàng"));
    }
};



exports.findALL = async (req, res, next) => {
    let documents = [];

    try {
        const cartService = new CartService(MongoDB.client);
        const { nxb_name } = req.query;
        if (nxb_name) {
            documents = await cartService.findByName(nxb_name);
        } else {
            documents = await cartService.find({});
        }
    } catch (error) {
        return next(
            new ApiError(500, "An Error Occurred while retrieving carts")
        );
    }

    return res.send(documents);
};

exports.getCart = async (req, res, next) => {
    try {
        const cartService = new CartService(MongoDB.client);
        const bookService = new BookService(MongoDB.client);
        const user_id = req.user.user_id;
        const cart = await cartService.findByUserId(user_id);
        if (!cart) {
            return res.send({
                user_id: user_id,
                books: [],
                totalCartPrice: 0,
            });
        }
        const booksWithImgAndName = await Promise.all(
            cart.books.map(async (item) => {
                const book = await bookService.findById(item.book_id);
                const total_price = item.quantity * parseInt(book.book_price);
                return {
                    book_id: item.book_id,
                    quantity: item.quantity,
                    book_name: book ? book.book_name : null,
                    book_image: book ? book.book_image : null,
                    book_price: book ? parseInt(book.book_price) : null,
                    book_borrowedNumber: book ? parseInt(book.book_borrowedNumber) : null,
                    book_number: book ? parseInt(book.book_number) : null,
                    total_price: book ? total_price : null,
                }
            })
        );

        // Lọc ra các cuốn sách không null (nếu có)
        const validBooks = booksWithImgAndName.filter(book => book !== null);

        // Tính tổng giá trị của toàn bộ giỏ hàng
        const totalCartPrice = validBooks.reduce((total, book) => total + book.total_price, 0);

        const cartWithBooks = {
            user_id: cart.user_id,
            books: booksWithImgAndName,
            totalCartPrice: totalCartPrice,
        };
        return res.send(cartWithBooks);
    } catch (error) {
        return next(
            new ApiError(500, "An Error Occurred while retrieving carts")
        );
    };
};

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length == 0) {
        return next(new ApiError(400, "Data to update can not be empty"));
    }

    try {
        const cartService = new CartService(MongoDB.client);
        const document = await cartService.update(req.params.user_id, req.body);
        if (!document) {
            return next(new ApiError(404, "cart not found"));
        }
        return res.send({ messgae: "cart was updated successfully" });
    } catch (error) {
        return next(
            new ApiError(500, `Error updating cart with id=${req.params.user_id}`)
        );
    }
};

exports.deleteBook = async (req, res, next) => {
    try {
        const cartService = new CartService(MongoDB.client);
        const user_id = req.user.user_id;
        const book_id = req.params.book_id;
        const deletedProduct = await cartService.deleteProductFromCart(user_id, book_id);
        if (!deletedProduct) {
            return next(new ApiError(404, "Không tìm thấy Id sách"));
        }
        return res.send({ messgae: "book was deleted successfully" });
    } catch (error) {
        return next(
            new ApiError(500, `Could not delete book with id=${req.params.id}`)
        );
    }
};

exports.deleteAllBook = async (req, res, next) => {
    try {
        const cartService = new CartService(MongoDB.client);
        const userId = req.user.user_id;
        const deletedCount = await cartService.deleteAllProducts(userId);
        return res.send({
            message: `${deletedCount} books were deleted successfully`,
        });
    } catch (error) {
        return next(
            new ApiError(500, "An Error Occurred while removing all books")
        );
    }
};

