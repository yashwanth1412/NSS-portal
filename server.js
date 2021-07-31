const express = require("express");
const path = require("path");

const app = require('./app.js')

const PORT = 3000;

app.listen(process.env.PORT || PORT, function(){
  console.log(`Server started at port ${PORT}`);
});
