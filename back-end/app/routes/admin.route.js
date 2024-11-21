const express = require("express");
const admins = require("../controllers/admin.controller");

const router = express.Router();
router
    .route("/")
    .get(admins.findALL)
    .post(admins.login)
    .delete(admins.deleteALL);

router
    .route("/:id")
    .get(admins.findOne)
    .put(admins.update)
    .delete(admins.delete);

module.exports = router;
