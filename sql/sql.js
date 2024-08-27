const mysql = require("@vlasky/mysql");
const express = require("express");
const SQLConfig = require("../const/sqlConfig");

const app = express();
const environment = app.get("env");
const connection = mysql.createConnection(SQLConfig.returnConfig(environment));

connection.on("connection", (connection) => {
  console.log("Database connected!");

  connection.on("error", (err) => {
    console.error(new Date(), "MySQL error", err.code);
  });

  connection.on("close", (err) => {
    console.error(new Date(), "MySQL close", err);
  });
});

module.exports = connection;
