const { promisify } = require("util");
var sql = require("../sql/sql");

// node native promisify
const asyncQuery = promisify(sql.query).bind(sql);

module.exports = class Log {
  constructor(
    originalUrl,
    body,
    ip,
    sessionUser,
    responseStatusCode,
    responseTime
  ) {
    this.endpoint = originalUrl;
    this.body = body;
    this.ip = ip;
    this.sessionUser = sessionUser;
    this.responseStatusCode = responseStatusCode;
    this.responseTime = responseTime;
  }

  setLog() {
    const rows = asyncQuery(
      `INSERT INTO logging (endpoint, ip, session_user, body, response_status_code, response_time) 
                VALUES (?, ?, ?, ?, ?, ?)`,
      [
        this.endpoint,
        this.ip,
        JSON.stringify(this.sessionUser),
        JSON.stringify(this.body),
        this.responseStatusCode,
        this.responseTime,
      ]
    );

    return rows;
  }
};
