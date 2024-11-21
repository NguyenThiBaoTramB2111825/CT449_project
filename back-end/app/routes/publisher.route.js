const express = require("express");
const publishers = require("../controllers/publisher.controller");
const authenticateToken = require('../middelware/jwt_admin');
const router = express.Router();
router
  .route("/")
  .get(publishers.findALL)
  .post(authenticateToken.authenticateTokenFromHeader, publishers.create)
  .delete(authenticateToken.authenticateTokenFromHeader, publishers.deleteALL);

router
  .route("/:id")
  .get(publishers.findOne)
  .put(authenticateToken.authenticateTokenFromHeader, publishers.update)
  .delete(authenticateToken.authenticateTokenFromHeader, publishers.delete);

module.exports = router;
