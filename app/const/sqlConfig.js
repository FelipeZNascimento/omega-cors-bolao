
var SQLConfig = {
    localhostConfig: {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'omegafox_bolaonfl',
        port: 3306
    },
    serverConfig: {
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASS,
        database: process.env.SQL_DB,
        port: process.env.PORT
    }
};

SQLConfig.returnConfig = function (port) {
    if (port === 8081) {
        return SQLConfig.localhostConfig;
    } else {
        return SQLConfig.serverConfig;
    }
};

module.exports = SQLConfig;