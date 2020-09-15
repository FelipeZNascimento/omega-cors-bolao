var mysql = require('mysql');
var port = process.env.PORT || 8081;
const SQLConfig = require('../app/const/sqlConfig');

console.log(`Running on port ${port}`);

var connection = mysql.createConnection(SQLConfig.returnConfig(port));

connection.connect(function (err) {
  if (err) throw err;
});

module.exports = connection;