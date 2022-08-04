const mysql = require("@vlasky/mysql");
const express = require("express");
const SQLConfig = require("../app/const/sqlConfig");

const app = express();
const environment = app.get("env");
const connection = mysql.createConnection(SQLConfig.returnConfig(environment));

connection.connect(function (err) {
  if (err) {
    console.log(err);
    throw err;
  }
});

module.exports = connection;
