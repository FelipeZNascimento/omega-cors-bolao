const express = require('express'),
    app = express(),
    cors = require('cors'),
    session = require('express-session'),
    MySQLStore = require('express-mysql-session')(session),
    SQLConfig = require('./app/const/sqlConfig'),
    dotenv = require('dotenv'),
    http = require('http');

dotenv.config();

const allowedOrigins = [
    'http://localhost',
    'http://localhost:3000',
    /\.omegafox\.me$/
];

app.use(cors({
    credentials: true,
    origin: allowedOrigins
}));
app.options('*', cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const sessionSecret = process.env.SESSION_SECRET;

const sevenDays = 7 * 24 * 60 * 60 * 1000;
const sessionSettings = {
    secret: sessionSecret,
    cookie: {
        maxAge: sevenDays
    },
    resave: true,
    saveUninitialized: false,
    rolling: true,
};

let serverPort = 8081;
const environment = app.get('env');
// const environment = 'production';
if (environment === 'production') {
    serverPort = 0;
    app.set('trust proxy', 1) // trust first proxy
    sessionSettings.cookie.secure = true; // serve secure cookies
    sessionSettings.cookie.sameSite = 'none'; // serve secure cookies
} else {
    sessionSettings.cookie.secure = false;
}

sessionSettings.store = new MySQLStore(SQLConfig.returnConfig(environment));

app.use(session(sessionSettings));
let server = http.createServer(app);

server.listen(serverPort, function () {
    console.log(`CORS-enabled web server listening on port ${server.address().port} at ${environment} environment`);
});

var routes = require('./app/routes/appRoutes'); //importing route 
routes(app); //register the routes

module.exports = app;
