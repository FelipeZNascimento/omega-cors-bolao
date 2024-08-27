var express = require("express");
var router = express.Router();
const matchController = require("../controller/match");

router.get("/", function (req, res, next) {
  res.send("What you wanna do with the matches huh?");
});

router.get("/list/:season/:week/", function (req, res, next) {
  matchController.list(req, res);
});

router.post("update/:season/:key", function (req, res, next) {
  matchController.updateBySeason(req, res);
});

router.get("/season/:season/", function (req, res, next) {
  matchController.listBySeason(req, res);
});

router.get("/week/:week/", function (req, res, next) {
  matchController.listByWeek(req, res);
});

module.exports = router;
