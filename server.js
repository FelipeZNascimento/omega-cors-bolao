const express = require('express'),
    app = express(),
    cors = require('cors'),
    port = process.env.PORT || 8081,
    session = require('express-session'),
    MySQLStore = require('express-mysql-session')(session),
    SQLConfig = require('./app/const/sqlConfig'),
    dotenv = require('dotenv');

dotenv.config();
var sessionStore = new MySQLStore(SQLConfig.returnConfig(port));

app.options('*', cors());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const sessionSecret = process.env.SESSION_SECRET;
const twentyEightDays = 28 * 24 * 60 * 60 * 1000;

const sessionInfo = {
    cookie: {
        maxAge: twentyEightDays,
        secret: sessionSecret
    },
    key: 'omega-cors-bolao-nfl-session',
    secret: sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    user: null
};

app.use(session(sessionInfo));
app.listen(port);

console.log('API server started on: ' + port);

var routes = require('./app/routes/appRoutes'); //importing route
routes(app); //register the route