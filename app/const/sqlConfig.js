const dotenv = require("dotenv");
dotenv.config();

var SQLConfig = {
  localhostConfig: {
    host: "localhost",
    user: "root",
    password: "",
    database: "omegafox_bolaonfl",
  },
  devServerConfig: {
    host: process.env.SQL_HOST_DEV,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASS,
    database: process.env.SQL_DB,
  },
  serverConfig: {
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASS,
    database: process.env.SQL_DB,
  },
};

SQLConfig.returnConfig = function (env) {
  if (env === "production") {
    return SQLConfig.serverConfig;
  } else {
    return SQLConfig.devServerConfig;
  }
};

module.exports = SQLConfig;
