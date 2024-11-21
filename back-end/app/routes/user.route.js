const express = require("express");
const users = require("../controllers/user.controller");
const authenticateToken = require("../middelware/jwt");
const authenticateTokenAdmin = require("../middelware/jwt_admin");

const router = express.Router();
router
    .route("/:token")
    .get(authenticateToken.authenticateTokenFromParams, users.findOne);
    
router
    .route("/:token")
    .put(authenticateToken.authenticateTokenFromParams, users.update);
    
router
    .route("/")
    .get(users.findALL)
    .post(users.create);
    // .delete(users.deleteALL);

router
    .route("/login")
    .post(users.loginUser);

router
    .route("/:id")
    .delete(authenticateTokenAdmin.authenticateTokenFromHeader, users.delete);

module.exports = router;
