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
const Log = require("./model/log.js");

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
const environment = app.get("env");

const sevenDays = 7 * 24 * 60 * 60 * 1000;
const sessionSettings = {
  secret: sessionSecret,
  cookie: {
    maxAge: sevenDays,
    secure: environment === "production",
    sameSite: environment === "production" ? "none" : "strict",
  },
  resave: true,
  saveUninitialized: false,
  rolling: true,
  user: null,
};

app.set("trust proxy", 1); // trust first proxy
let serverPort = 0;
let server;
if (environment === "production") {
  server = http.createServer(app);
} else {
  serverPort = 63768;
  server = https.createServer(
    {
      key: fs.readFileSync("./cert/localhost.key"),
      cert: fs.readFileSync("./cert/localhost.crt"),
    },
    app
  );
}

sessionSettings.store = new MySQLStore(SQLConfig.returnConfig(environment));
app.use(session(sessionSettings));

app.use(function responseLogger(req, res, next) {
  const originalSendFunc = res.send.bind(res);

  const timestamp_start = new Date();
  res.send = function (body) {
    const responseTime = new Date() - timestamp_start;
    const sessionUser = req.session.user || "not logged";
    const logInstance = new Log(
      req.originalUrl,
      req.body,
      req.ip,
      sessionUser,
      res.statusCode,
      responseTime
    );

    if (
      environment === "production" &&
      req.method === "POST" &&
      !req.originalUrl.includes("match/update") // This call was flooding the logs
    ) {
      logInstance.setLog();
    }
    console.log(logInstance);
    return originalSendFunc(body);
  };
  next();
});

app.use("/bolaonfl/user", userRouter);
app.use("/bolaonfl/bet", betRouter);
app.use("/bolaonfl/extrabet", extraBetRouter);
app.use("/bolaonfl/team", teamRouter);
app.use("/bolaonfl/match", matchRouter);
app.use("/bolaonfl/ranking", rankingRouter);
app.use("/bolaonfl/record", recordRouter);
app.use("/bolaonfl", initializeRouter);

// Catches 404
app.use(function (req, res) {
  return res.status(400).send({
    message: "Not found",
    request: req.url,
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
