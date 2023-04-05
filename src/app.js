const express = require("express");
const path = require("path");
const morgan = require("morgan");
const mysql = require("mysql");
const cookieParser = require("cookie-parser");
const myConnection = require("express-myconnection");

const userRoutes = require("./routes/routes");

const app = express();
app.use(cookieParser());

//settings
app.set("port", process.env.PORT || 4000);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//middlewares
//app.use(morgan("dev"));

app.use(
  myConnection(
    mysql,
    {
      host: "aws.connect.psdb.cloud",
      user: "xr4idawojgxwobdd9zzs",
      password: "pscale_pw_19CxTejhE9GB6olyNBVTFHlXZtClFg0oZ9OTXtE7EQi",
      port: 3306,
      database: "gestion",
      ssl: true,
    },
    "single"
  )
);

app.use(express.urlencoded({ extended: false }));

//routes
app.use("/", userRoutes);

//static files
app.use(express.static(path.join(__dirname, "public")));

module.exports = app; // exportar la instancia de Express
