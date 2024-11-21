const express = require("express");
const checkout = require("../controllers/checkout.controller");
const authenticateToken = require("../middelware/jwt");

const router = express.Router();

// Tạo 1 checkout
router
    .route("/")
    .post(authenticateToken.authenticateTokenFromHeader, checkout.create)

// Lấy checkout
router
    .route("/:token")
    .get(authenticateToken.authenticateTokenFromParams, checkout.findOne)

module.exports = router;
