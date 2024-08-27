var express = require("express");
var router = express.Router();
const teamController = require("../controller/team");

router.get("/", function (req, res, next) {
  res.send("What you wanna do with the teams huh?");
});

router.get("/list", function (req, res, next) {
  teamController.listAll(req, res);
});

module.exports = router;