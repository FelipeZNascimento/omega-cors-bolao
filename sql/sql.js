var mysql = require('mysql');
var SQLConfig = require('../app/const/sqlConfig');

var port = process.env.PORT || 8081;
console.log(SQLConfig.returnConfig(port));
var connection = mysql.createConnection(SQLConfig.returnConfig(port));

connection.connect(function (err) {
  if (err) throw err;
});

module.exports = connection;