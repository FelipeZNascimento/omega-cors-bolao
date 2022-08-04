const express = require("express"),
  app = express(),
  cors = require("cors"),
  session = require("express-session"),
  MySQLStore = require("express-mysql-session")(session),
  SQLConfig = require("./app/const/sqlConfig"),
  dotenv = require("dotenv"),
  http = require("http"),
  https = require("https"),
  fs = require("fs");

// How to create localhost https node server
// https://nodejs.org/en/knowledge/HTTP/servers/how-to-create-a-HTTPS-server/

dotenv.config();

const allowedOrigins = [
  "https://localhost",
  "http://localhost",
  "https://localhost:3000",
  "http://localhost:3000",
  /\.omegafox\.me$/,
];

app.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
  })
);
app.options("*", cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const sessionSecret = process.env.SESSION_SECRET;

const sevenDays = 7 * 24 * 60 * 60 * 1000;
const sessionSettings = {
  secret: sessionSecret,
  cookie: {
    maxAge: sevenDays,
  },
  resave: true,
  saveUninitialized: false,
  rolling: true,
};

let server;
let serverPort;
const environment = app.get("env");

sessionSettings.cookie.secure = true;
sessionSettings.cookie.sameSite = "none";
app.set("trust proxy", 1); // trust first proxy

if (environment === "production") {
  serverPort = 0;
  server = http.createServer(app);
} else {
  serverPort = 63768;
  server = https.createServer(
    {
      key: fs.readFileSync("certs/key.pem"),
      cert: fs.readFileSync("certs/cert.pem"),
    },
    app
  );
}

sessionSettings.store = new MySQLStore(SQLConfig.returnConfig(environment));

app.use(session(sessionSettings));

server.listen(serverPort, function () {
  console.log(
    `CORS-enabled web server listening on port ${
      server.address().port
    } at ${environment} environment`
  );
});

var routes = require("./app/routes/appRoutes"); //importing route
routes(app); //register the routes

module.exports = app;
