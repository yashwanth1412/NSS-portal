const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const fastcsv = require("fast-csv");
const XMLHttpRequest = require("xmlhttp");
const http = require('http');
const multer = require('multer');
const uuid = require('uuid').v4;
const app = express();

const storage = multer.diskStorage({
  destination:(req,file,cb)=>{cb(null,'');}
                              ,filename:(req,file,cb)=>{
                                const{originalname}=file;
                                cb(null,'inpFile');
                              }
                    });
    const upload = multer({storage});
app.use(bodyParser.urlencoded({extended: true}));

app.get("/",function(req,res){
    res.sendFile(__dirname+"/first.html");
});



app.post("/",upload.single('fileName'),function(req,res){
    res.json({status:'Ok'});

var i = req.body.filename;
  let stream = fs.createReadStream('inpFile');
  let csvData = [];
  let csvStream = fastcsv
    .parse()
    .on("data", function(data) {
      csvData.push(data);
    })
    .on("end", function() {
      // remove the first line: header
      csvData.shift();
      const connection = mysql.createConnection({
       host: "localhost",
       user: "root",
       password: "Akhi@2002",
       database: "connecto"
     });

     // open the connection
     connection.connect(error => {
       if (error) {
         console.error(error);
       } else {
         let query =
           "INSERT INTO category (id, name, description, created_at) VALUES ?";
         connection.query(query, [csvData], (error, response) => {
           console.log(error || response);
         });
       }
     });
  });

  stream.pipe(csvStream);
});

   app.listen(3000,function(){
   console.log("Server started at port 3000");
 });
