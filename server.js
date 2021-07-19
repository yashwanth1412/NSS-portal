const express = require("express");
const path = require("path");

const app = require('./app.js')

app.listen(3000, function(){
  console.log("Server started at port 3000");
});
