const express = require("express");
const fs = require("fs")
const csv = require("fast-csv");

const User = require("./models/user.js")
const Event = require("./models/event.js")
const User_Events = require("./models/user_events.js")
const Category = require('./models/category.js');

const check_admin = require("./middleware/check_admin.js");
const upload = require("./middleware/file_upload.js");

router = express.Router()

router.use(check_admin)

router.get("/", (req, res) => {
  res.render("admin-page/add_event")
})

router.post("/", upload.single("fileName"), async(req, res, next) => {
  try {
    if (req.file == undefined) {
      let err = new Error("Please upload a csv file");
      throw err;
    }

    var event = await Event.create({
      name: req.body.event,
      date: new Date(req.body.date),
      fk_category: req.body.dropdown
    })
    
    let path = __dirname + "/records/" + req.file.filename;
    let csvData = [];

    var parser = await fs.createReadStream(path)
    .pipe(csv.parse({ headers: true }))
    .on("error", (error) => {
      throw error;
    })
    .on("data", async(row) => {
      parser.pause();
      
      User_Events.create({
        UserEmail: row.email,
        EventId: event.id,
        hours: row.hours
      }).then(user => {
        console.log("uploaded")
      }).catch(err => {
        console.log(err)
        next(err)
      })

      parser.resume();
    })
    .on("end", () => {
      console.log("Done")
    });
    res.redirect('/admin')
  } 
  catch (err) {
    next(err)
  }
      
})

module.exports = router