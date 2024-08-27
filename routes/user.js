var express = require("express");
var router = express.Router();
const userController = require("../controller/user");

router.get("/", function (req, res) {
  res.send("What you wanna do with the users huh?");
});

router.get("/list", function (req, res) {
  userController.listAll(req, res);
});

router.post("/update", function (req, res) {
  userController.update(req, res);
});

router.post("/updatePreferences", function (req, res) {
  userController.updatePreferences(req, res);
});

router.post("/register", function (req, res) {
  userController.register(req, res);
});

router.post("/login", function (req, res) {
  userController.login(req, res);
});

router.get("/logout", function (req, res) {
  userController.logout(req, res);
});

router.get("/:id", function (req, res) {
  userController.listById(req, res);
});

module.exports = router;
