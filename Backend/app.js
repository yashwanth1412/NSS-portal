require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql")

const app = express();

var mysqlConnection = mysql.createConnection({
    host: process.env.DB_HOST ,
    user: process.env.DB_USER ,
    password: process.env.DB_PASSWORD ,
    database: process.env.DB_NAME ,
    multipleStatements: true
});

mysqlConnection.connect((err)=> {
    if(!err)
        console.log('Connection Established Successfully');
    else
        console.log('Connection Failed!'+ JSON.stringify(err,undefined,2));
});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static("public"));

app.get("/", (req, res)=> {
    res.send("<h1>Hello<h1>")
})


module.exports = app