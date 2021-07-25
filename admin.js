const express = require("express");
const fs = require("fs")
const csv = require("fast-csv");

const User = require("./models/user.js")
const Event = require("./models/event.js")
const User_Events = require("./models/user_events.js")
const Category = require('./models/category.js');

const check_admin = require("./middleware/check_admin.js");
const upload = require("./middleware/file_upload.js")

router = express.Router()

router.use(check_admin)

router.get("/", (req, res) => {
    res.render("admin")
})

router.post("/", upload.single("fileName"), async(req, res, next) => {
    try {
        if (req.file == undefined) {
          let err = new Error("Please upload a csv file");
          throw err;
        }
        
        let path = __dirname + "/records/" + req.file.filename;
        let csvData = [];

        var parser = fs.createReadStream(path)
        .pipe(csv.parse({ headers: true }))
        .on("error", (error) => {
          throw error;
        })
        .on("data", (row) => {
          parser.pause();
          csvData.push(row);
          console.log(row)
          
          parser.resume();
        })
        .on("end", () => {
          res.send(csvData)
        });
      } 
      catch (err) {
        next(err)
      }
      
})

module.exports = router

// Event.create({
//   name: req.params.event,
//   date: new Date(),
//   fk_category: 1
//   })

// await User_Events.create({
// UserEmail: req.user.email,
// EventId: e.id,
// hours: 5
// })