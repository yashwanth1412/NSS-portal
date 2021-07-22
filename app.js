require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql")
const app = express();

const User = require("./models/user.js")
const Event = require("./models/event.js")
const User_Events = require("./models/user_events.js")
const db_sequelize = require("./db.js");
const Category = require('./models/category.js');

db_sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

async function test(){
  await db_sequelize.sync()
}

test()

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static("public"));

app.get("/", (req, res)=> {
    res.send("<h1>Hello<h1>")
})


module.exports = app