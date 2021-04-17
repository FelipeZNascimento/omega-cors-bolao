const express = require('express'),
    app = module.exports = express(),
    cors = require('cors'),
    port = process.env.PORT || 8081,
    session = require('express-session'),
    MySQLStore = require('express-mysql-session')(session),
    SQLConfig = require('./app/const/sqlConfig'),
    dotenv = require('dotenv');

dotenv.config();


var allowedOrigins = ['https://bolao.omegafox.me', 'http://localhost'];
// var corsOptions = {
//     origin: function (origin, callback) {
//         if (allowedOrigins.indexOf(origin) !== -1) {
//             callback(null, true)
//         } else {
//             callback(new Error('Not allowed by CORS'))
//         }
//     },
//     methods: ['POST', 'GET', 'OPTIONS', 'HEAD'],
//     credentials: true
// };

var corsOptions = {
    origin: allowedOrigins,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }
  
app.use(cors(corsOptions));
app.options('*', cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var sessionStore = new MySQLStore(SQLConfig.returnConfig(port));
const sessionSecret = process.env.SESSION_SECRET;

const twentyEightDays = 28 * 24 * 60 * 60 * 1000;

app.use(session({
    key: 'omega-cors-bolao-nfl-session',
    secret: sessionSecret,
    fetchs: 0,
    cookie: {
        maxAge: twentyEightDays,
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

console.log('API server started on: ' + port);

var routes = require('./app/routes/appRoutes'); //importing route
routes(app); //register the route