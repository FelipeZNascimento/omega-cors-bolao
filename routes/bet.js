var express = require("express");
var router = express.Router();
const betsController = require("../controller/bet");

router.get("/", function (req, res) {
  res.send("What you wanna do with the bets huh?");
});

router.get("/list/:season/:week", function (req, res) {
  betsController.listBetsBySeasonAndWeek(req, res);
});

router.post("/update", function (req, res) {
  betsController.updateRegularBets(req, res);
});

module.exports = router;
