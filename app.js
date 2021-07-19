require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql")
const app = express();

const User = require("./models/user.js")
const db_sequelize = require("./db.js")

db_sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

User.sync({alter:true}).then(() => {
  return User.create({
    name: 'Yash',
    rollno: 'CS19B1030',
    email : 'cs19b1030@iiitr.ac.in'
  });
});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static("public"));

app.get("/", (req, res)=> {
    res.send("<h1>Hello<h1>")
})


module.exports = app