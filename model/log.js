const { promisify } = require("util");
var sql = require("../sql/sql");

// node native promisify
const asyncQuery = promisify(sql.query).bind(sql);

module.exports = class Log {
  constructor(originalUrl, sessionUser, responseStatusCode, responseTime) {
    this.endpoint = originalUrl;
    this.sessionUser = sessionUser;
    this.responseStatusCode = responseStatusCode;
    this.responseTime = responseTime;
  }

  setLog() {
    const rows = asyncQuery(
      `INSERT INTO logging (endpoint, session_user, response_status_code, response_time) 
                VALUES (?, ?, ?, ?)`,
      [
        this.endpoint,
        this.sessionUser,
        this.responseStatusCode,
        this.responseTime,
      ]
    );

    return rows;
  }
};
