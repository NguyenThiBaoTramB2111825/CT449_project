const express = require("express");
const books = require("../controllers/book.controller");
const authenticateToken = require("../middelware/jwt_admin");

const router = express.Router();
router
    .route("/")
    .get(books.findALL)
    .post(authenticateToken.authenticateTokenFromHeader, books.create);
    // .delete(books.deleteALL);

// Tìm kiếm sách
router
    .route("/search")
    .get(books.search)

// Sách ở trang chủ
router
    .route("/productsHome")
    .get(books.productsHome)

// Lọc sách theo nhà xuất bản
router
    .route("/publisher/:publisher_id")
    .get(books.filterBooksWithPublisher)
    
// Kiểm tra số lượng mượn
router
    .route("/checkNumber")
    .post(books.checkNumberBook)

router
    .route("/:id")
    .get(books.findOne)
    .put(authenticateToken.authenticateTokenFromHeader, books.update)
    .delete(authenticateToken.authenticateTokenFromHeader, books.delete);

module.exports = router;
