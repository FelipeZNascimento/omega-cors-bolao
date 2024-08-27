var express = require("express");
var router = express.Router();
const betsController = require("../controller/bet");

router.get("/", function (req, res, next) {
  res.send("What you wanna do with the bets huh?");
});

router.get("/:season/:week", function (req, res, next) {
  betsController.listBetsBySeasonAndWeek(req, res);
});

router.post("/update", function (req, res, next) {
  betsController.updateRegularBets(req, res);
});

module.exports = router;
