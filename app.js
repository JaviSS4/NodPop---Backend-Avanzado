"use strict";

const express = require("express");
const path = require("path");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const session = require("express-session");
const LoginController = require("./controllers/loginController");
const sessionAuth = require("./lib/sessionMiddleware");
const MongoStore = require("connect-mongo");

/* jshint ignore:start */
const db = require("./lib/connectMongoose");
/* jshint ignore:end */

// Cargamos las definiciones de todos nuestros modelos
require("./models/Anuncio");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

// Global Template variables
app.locals.title = "NodePop";

//Inicializar i18n
const i18n = require("./lib/i18nConfigure");
app.use(i18n.init);
/* i18n.setLocale("es");
console.log(i18n.__("Welcome to NodePop")); */

// Setup de sesiones del website

app.use(
  session({
    name: "nodepop-session",
    secret: "a;!6$%8&m!b<s>[V>9X,6k(tdkSD8Q-E",
    saveUninitialized: true,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, //de inactividad
    },
    store: MongoStore.create({
      mongoUrl: "MONGODB_CONNECTION_STRING",
    }),
  })
);

// hacer disponible la sesión para todas las vistas
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Web
const loginController = new LoginController();

app.use("/", require("./routes/index"));
app.use("/anuncios", require("./routes/anuncios"));

app.get("/login", loginController.index);
app.post("/login", loginController.post);
app.get("/logout", loginController.logout);

app.use("/privado", sessionAuth, require("./routes/privado"));

app.use("/change-locale", require("./routes/change-locale"));
// API v1
app.use("/apiv1/anuncios", require("./routes/apiv1/anuncios"));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  if (err.array) {
    // validation error
    err.status = 422;
    const errInfo = err.array({ onlyFirstError: true })[0];
    err.message = isAPI(req)
      ? { message: "not valid", errors: err.mapped() }
      : `not valid - ${errInfo.param} ${errInfo.msg}`;
  }

  // establezco el status a la respuesta
  err.status = err.status || 500;
  res.status(err.status);

  // si es un 500 lo pinto en el log
  if (err.status && err.status >= 500) console.error(err);

  // si es una petición al API respondo JSON...
  if (isAPI(req)) {
    res.json({ success: false, error: err.message });
    return;
  }

  // ...y si no respondo con HTML...

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.render("error");
});

function isAPI(req) {
  return req.originalUrl.indexOf("/api") === 0;
}

module.exports = app;
