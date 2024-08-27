var express = require("express");
var router = express.Router();
const configController = require("../controller/config");

// Catches root
router.get("/", function (req, res) {
  res.send("Hello?????");
});

router.get("/initialize", function (req, res) {
  configController.default(req, res);
});

module.exports = router;
