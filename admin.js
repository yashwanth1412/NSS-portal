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

router.get("/", async(req, res) => {
  let events = await Event.findAll({
    order: [
      ['date', 'ASC'],
      ['name', 'ASC']
    ]
  })
  res.render("admin-page/home", {
    events: events
  })
})

router.get("/add_event", (req, res) => {
  res.render("admin-page/add_event")
})

router.post("/add_event", upload.single("fileName"), async(req, res, next) => {
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

router.get("/volunteers", async(req, res) => {
  let users = await User.findAll({
    order: [
      ['name', 'ASC']
    ]
  })
  res.render("admin-page/volunteers", {
    users: users
  })
})

router.get("/add_volunteers", (req, res) => {
  res.render("admin-page/add_volunteers")
})

router.post("/add_volunteers", upload.single("fileName"), async(req, res, next) => {
  try {
    if (req.file == undefined) {
      let err = new Error("Please upload a csv file");
      throw err;
    }
    
    let path = __dirname + "/records/" + req.file.filename;

    var parser = await fs.createReadStream(path)
    .pipe(csv.parse({ headers: true }))
    .on("error", (error) => {
      throw error;
    })
    .on("data", async(row) => {
      parser.pause();

      User.findOrCreate({
        name: row.name,
        rollno: row.rollno.toLowerCase(),
        email : row.email.toLowerCase()
      }).catch(err => {
        console.log(err)
        next(err)
      })

      parser.resume();
    })
    .on("end", () => {
      console.log("Done")
    });
    res.redirect('/admin/volunteers')
  } 
  catch (err) {
    next(err)
  } 
})

module.exports = router