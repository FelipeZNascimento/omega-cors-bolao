const express = require('express'),
    app = module.exports = express(),
    cors = require('cors'),
    port = process.env.PORT || 8081,
    session = require('express-session'),
    MySQLStore = require('express-mysql-session')(session),
    SQLConfig = require('./app/const/sqlConfig'),
    dotenv = require('dotenv');

dotenv.config();
const allowedOrigins = ['http://localhost:3000', 'https://bolao.omegafox.me'];
app.use(cors({ credentials: true, origin: allowedOrigins }));
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
const sessionSettings = {
    secret: sessionSecret,
    cookie: {
        maxAge: sevenDays,
        // sameSite: 'none',
        // secure: 'auto'
    },
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    user: null
};

if (app.get('env') === 'production') {
    console.log('is production');
    app.set('trust proxy', 1) // trust first proxy
    sessionSettings.cookie.secure = true; // serve secure cookies
    sessionSettings.cookie.sameSite = 'none'; // serve secure cookies
} else {
    sessionSettings.cookie.secure = false;
}

app.use(session(sessionSettings));

app.listen(port, function () {
    console.log('CORS-enabled web server listening on port ' + port);
});

var routes = require('./app/routes/appRoutes'); //importing route 
routes(app); //register the route