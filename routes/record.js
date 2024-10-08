var express = require("express");
var router = express.Router();
const rankingController = require("../controller/ranking");

router.get("/", function (req, res) {
  res.send("What you wanna do with the records huh?");
});

router.post("/list/", function (req, res) {
  rankingController.listRecords(req, res);
});

router.get("/update/:week", function (req, res) {
  rankingController.updateWeeklyRecords(req, res);
});

module.exports = router;
