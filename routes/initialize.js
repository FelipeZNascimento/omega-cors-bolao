var express = require("express");
var router = express.Router();
const configController = require("../controller/config");

// Catches root
router.get("/", function (req, res, next) {
  res.send("Hello?????");
});

router.get("/initialize", function (req, res, next) {
  configController.default(req, res);
});

module.exports = router;
