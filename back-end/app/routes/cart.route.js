const express = require("express");
const carts = require("../controllers/cart.controller");
const authenticateToken = require("../middelware/jwt");

const router = express.Router();

// Thêm vào giỏ
router
    .route("/")
    .post(authenticateToken.authenticateTokenFromHeader, carts.addtocart)

// Lấy giỏ hàng
router
    .route("/:token")
    .get(authenticateToken.authenticateTokenFromParams, carts.getCart)
    // .put(carts.update)

// Xóa tất cả sách trong giỏ khi tiến hành mượn
router
    .route("/deleteAll")
    .delete(authenticateToken.authenticateTokenFromHeader, carts.deleteAllBook);
    
// Xóa sách trong giỏ
router
    .route("/:book_id")
    .delete(authenticateToken.authenticateTokenFromHeader, carts.deleteBook);

    
module.exports = router;
