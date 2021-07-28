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

    console.log(path)

    var parser = await fs.createReadStream(path)
    .pipe(csv.parse({ headers: true }))
    .on("error", (error) => {
      throw error;
    })
    .on("data", async(row) => {
      parser.pause();
      User.findOrCreate({
        where: {
          email: row.email.toLowerCase(),
        },
        defaults: {
          name: row.name.toUpperCase(),
          rollno: row.rollno.toLowerCase(),
          email : row.email.toLowerCase()
        }
        
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

router.get("/change", async(req, res) => {
  res.render("admin-page/user_hrs-change")
})

router.post('/change', async(req, res, next) => {
  try {
    var user = await User.findOne({
      where: {
        rollno: req.body.rollno.toLowerCase()
      }
    })

    if(!user){
      return res.send(`<h1>No user with Roll no ${req.body.rollno} exists!</h1>`)
    }

    var a = await User_Events.findAll({
      where: {
        UserEmail: req.body.rollno.toLowerCase() + "@iiitr.ac.in"
      },
      include: Event
    })
    a = a.map(events => {
      return {...events.Event.dataValues, ...events.dataValues};
    })
  } catch(err) {
    next(err)
  }

  var b = a.map(entry => {
    return {
      "id" : entry.id,
      "date" : entry.date,
      "name" : entry.name,
      "hrs" : entry.hours,
      "category" : entry.fk_category,
      "email" : entry.UserEmail
    }
  });
  var agg_hrs = 0;
  a.forEach((data, i) => {
    agg_hrs += data.hours;
  });


  var info = {
    "name" : user.name,
    "mail" : user.email,
    "hrs" : agg_hrs
  };

  console.log(b)


  res.render("ajax-index", {list: b, info: info});
})

router.post("/update_hrs", async(req, res) => {
  console.log("hello")
  console.log(req.body)
  try{
    var p = await User_Events.findOne({
        where: {
          UserEmail : req.body.email,
          EventId: req.body.event_id
        }
      })
    await p.update({
      hours: req.body.hours
    })
  }
  catch{

  }
  res.redirect("/admin/change")
})

module.exports = router