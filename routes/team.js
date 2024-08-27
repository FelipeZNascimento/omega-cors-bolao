var express = require("express");
var router = express.Router();
const teamController = require("../controller/team");

router.get("/", function (req, res) {
  res.send("What you wanna do with the teams huh?");
});

router.get("/list", function (req, res) {
  teamController.listAll(req, res);
});

module.exports = router;