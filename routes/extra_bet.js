var express = require("express");
var router = express.Router();
const betsController = require("../controller/bet");

router.get("/", function (req, res, next) {
  res.send("What you wanna do with the extra bets huh?");
});

router.get("/list/:season", function (req, res, next) {
  betsController.listExtraBets(req, res);
});

router.post("/update", function (req, res, next) {
  betsController.updateExtraBets(req, res);
});

module.exports = router;
