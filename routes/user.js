var express = require("express");
var router = express.Router();
const userController = require("../controller/user");

router.get("/", function (req, res, next) {
  res.send("What you wanna do with the users huh?");
});

router.get("/list", function (req, res, next) {
  userController.listAll(req, res);
});

router.post("/update", function (req, res, next) {
  userController.update(req, res);
});

router.post("/updatePreferences", function (req, res, next) {
  userController.updatePreferences(req, res);
});

router.post("/register", function (req, res, next) {
  userController.register(req, res);
});

router.post("/login", function (req, res, next) {
  userController.login(req, res);
});

router.get("/logout", function (req, res, next) {
  userController.logout(req, res);
});

router.get("/:id", function (req, res, next) {
  userController.listById(req, res);
});

module.exports = router;
