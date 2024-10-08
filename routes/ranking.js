var express = require("express");
var router = express.Router();
const rankingController = require("../controller/ranking");

router.get("/", function (req, res) {
  res.send("What you wanna do with the ranking huh?");
});

router.get("/list/:season/:week", function (req, res) {
  rankingController.listBySeasonAndWeek(req, res);
});

router.get("/history/:season", function (req, res) {
  rankingController.listRankingHistory(req, res);
});

router.get("/season/:season", function (req, res) {
  rankingController.listBySeason(req, res);
});

module.exports = router;
