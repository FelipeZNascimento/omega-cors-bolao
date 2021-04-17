const express = require('express'),
    app = module.exports = express(),
    cors = require('cors'),
    port = process.env.PORT || 8081,
    session = require('express-session'),
    MySQLStore = require('express-mysql-session')(session),
    SQLConfig = require('./app/const/sqlConfig'),
    dotenv = require('dotenv');

dotenv.config();
app.use(cors({ credentials: true }));
app.options('*', cors());

// app.use(cors({
//     origin: '*',
//     methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
//     credentials: true
// }));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var sessionStore = new MySQLStore(SQLConfig.returnConfig(port));
const sessionSecret = process.env.SESSION_SECRET;

const sevenDays = 7 * 24 * 60 * 60 * 1000;

app.use(session({
    key: 'omega-cors-bolao-nfl-session',
    secret: sessionSecret,
    fetchs: 0,
    cookie: {
        maxAge: sevenDays,
        secure: process.env.SECURE_COOKIES
    },
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    user: null
}));

app.listen(port, function () {
    console.log('CORS-enabled web server listening on port ' + port);
});

var routes = require('./app/routes/appRoutes'); //importing route 
routes(app); //register the route