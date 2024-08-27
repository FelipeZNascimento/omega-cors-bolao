const express = require("express"),
  app = express(),
  cors = require("cors"),
  session = require("express-session"),
  MySQLStore = require("express-mysql-session")(session),
  SQLConfig = require("./const/sqlConfig"),
  dotenv = require("dotenv"),
  http = require("http"),
  https = require("https"),
  fs = require("fs");

// Routers
const userRouter = require("./routes/user");
const betRouter = require("./routes/bet");
const extraBetRouter = require("./routes/extra_bet");
const teamRouter = require("./routes/team");
const matchRouter = require("./routes/match");
const rankingRouter = require("./routes/ranking");
const recordRouter = require("./routes/record");
const initializeRouter = require("./routes/initialize");

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
  server = http.createServer(app);
  //   server = https.createServer(
  //     {
  //       key: fs.readFileSync("certs/key.pem"),
  //       cert: fs.readFileSync("certs/cert.pem"),
  //     },
  //     app
  //   );
}

sessionSettings.store = new MySQLStore(SQLConfig.returnConfig(environment));
app.use(session(sessionSettings));
app.use("/user", userRouter);
app.use("/bet", betRouter);
app.use("/extrabet", extraBetRouter);
app.use("/team", teamRouter);
app.use("/match", matchRouter);
app.use("/ranking", rankingRouter);
app.use("/record", recordRouter);
app.use("/", initializeRouter);

// Catches 404
app.use(function (req, res, next) {
  return res.status(400).send({
    message: "Not found.",
  });
});

server.listen(serverPort, function () {
  console.log(
    `CORS-enabled web server listening on port ${
      server.address().port
    } at ${environment} environment`
  );
});

module.exports = app;
