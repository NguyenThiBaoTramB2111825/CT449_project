const express = require("express");
const borrow = require("../controllers/borrow.controller");
const authenticateToken = require("../middelware/jwt");
const authenticateTokenAdmin = require("../middelware/jwt_admin");

const router = express.Router();

router
    .route("/")
    .get(borrow.findALL)
    .post(authenticateToken.authenticateTokenFromHeader, borrow.addtoTrackBookBorrowing)

// Lấy tất cả các đơn mượn từ user_id
router
    .route("/borrow/:borrowId")
    .get(borrow.getBorrowWithID)

// Lấy tất cả các đơn mượn từ user_id
router
    .route("/:token")
    .get(authenticateToken.authenticateTokenFromParams, borrow.getBorrowWithUserId)

// Cập nhật số lượng sách trả (Admin)
router
    .route("/updateReturnNumber/:id")
    .put(authenticateTokenAdmin.authenticateTokenFromHeader, borrow.updateReturnBookNumber)

router 
    .route("/update/:borrowId")
    .put(authenticateTokenAdmin.authenticateTokenFromHeader, borrow.updateStatusOfAdmin) // Bên admin
    
// Cập nhật trạng thái đơn mượn và số lượng sách mượn trong collection 'books' 
router
    .route("/:borrowId")
    .put(authenticateToken.authenticateTokenFromHeader, borrow.updateStatus) // bên user
    .delete(authenticateTokenAdmin.authenticateTokenFromHeader, borrow.deleteBorrowWithId)

module.exports = router;
