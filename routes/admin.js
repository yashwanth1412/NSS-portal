const express = require("express");
const path = require("path");

const User = require("../models/user.js")
const Event = require("../models/event.js")
const User_Events = require("../models/user_events.js")
const Category = require('../models/category.js');

const check_admin = require("../middleware/check_admin.js");
const upload = require("../middleware/file_upload.js");
const flash_messages = require("../middleware/messages.js");

const read_file = require("../utilities/read_file.js")
router = express.Router()

router.use(check_admin)
router.use(flash_messages)



router.get("/", async(req, res, next) => {
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

router.get("/add_event", async(req, res) => {
  var cat = await Category.findAll()
  res.render("admin-page/add_event", {
    num: cat.length
  })
})

router.post("/add_event", upload.single("fileName"), async(req, res, next) => {
  try {
    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv)$/;
    var valid = regex.test(req.file.filename);
    if (req.file == undefined || !valid) {
      let err = new Error("Please upload a csv file");
      throw err;
    }

    var e = await Event.findOne({
      where: {
        name: req.body.event,
        date: new Date(req.body.date)
      }
    })

    if(e){
      let err = new Error("A event with same name and date already exists")
      err.statusCode = 409
      throw err
    }
    
    let reqPath = path.join(__dirname, '../')
    let Path = reqPath + "/records/" + req.file.filename;

    const arr = await read_file(Path, ['email', 'hours'])
    
    if(!arr.status){
      req.session.message = {
        type: "warning",
        message: arr.message
      };
      return res.redirect('/admin/add_event');
    }

    var event = await Event.create({
      name: req.body.event,
      date: new Date(req.body.date),
      fk_category: req.body.dropdown
    }).catch(err =>{
      throw err
    })

    for(var i=0; i<arr.data.length; i++){
      await User_Events.create({
        UserEmail: arr.data[i].email,
        EventId: event.id,
        hours: arr.data[i].hours
      }).catch(err => {
        throw err
      })
    }
    
    req.session.message = {
      type: "success",
      message: "Successfully uploaded and saved csv file"
    };
    res.redirect('/admin');
  } 
  catch (err) {
    req.session.message = {
      type: "danger",
      message: err.message
    }
    return res.redirect('/admin/add_event');
  }    
})

router.get("/volunteers", async(req, res) => {
  let users = await User.findAll({
    order: [
      ['email', 'ASC']
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
    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv)$/;
    var valid = regex.test(req.file.filename);
    if (req.file == undefined || !valid) {
      let err = new Error("Please upload a csv file");
      throw err;
    }
    
    let reqPath = path.join(__dirname, '../')
    let Path = reqPath + "records/" + req.file.filename;

    const arr = await read_file(Path, ["name", "rollno", "email"])

    if(!arr.status){
      req.session.message = {
        type: "warning",
        message: arr.message
      };
      return res.redirect('/admin/add_volunteers');
    }

    for(var i=0; i<arr.data.length; i++){
      await User.findOrCreate({
          where: {
            email: arr.data[i].email.toLowerCase(),
          },
          defaults: {
            name: arr.data[i].name.toUpperCase(),
            rollno: arr.data[i].rollno.toLowerCase(),
            email : arr.data[i].email.toLowerCase()
          }
        }).catch(err => {
          throw err
        })
    }

    req.session.message = {
      type: "success",
      message: "Successfully uploaded and saved csv file"
    };
    res.redirect('/admin/volunteers');
    
  } 
  catch (err) {
    req.session.message = {
      type: "danger",
      message: err.message
    }
    return res.redirect('/admin/add_volunteers');
  } 
})

router.get("/user_search", async(req, res) => {
  res.render("admin-page/user_hrs-change")
})

router.post('/user_search', async(req, res, next) => {
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
        UserEmail: user.email
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

  res.render("ajax-index", {list: b, info: info});
})

router.post("/update_hrs", async(req, res) => {
  try{
    var p = await User_Events.findOne({
        where: {
          UserEmail : req.body.email,
          EventId: req.body.event_id
        }
      })
    await p.update({
      hours: req.body.hours
    }).catch(err => {
      throw err
    })

    req.session.message = {
      type: "success",
      message: `Successfully updated hours for user whose email is: ${req.body.email}`
    };
    return res.redirect('/admin/user_search');
  }
  catch(err){
    req.session.message = {
      type: "danger",
      message: err.message
    }
    return res.redirect('/admin/user_search');
  }
})

router.post("/delete_event", async(req, res) => {
  try {
    await User_Events.destroy({
      where: {
        EventId: req.body.event_id
      }
    })

    await Event.destroy({
      where: {
        id: req.body.event_id
      }
    }).catch((err) => {
      throw err
    })

    req.session.message = {
      type: "success",
      message: 'Successfully deleted event'
    };
    res.redirect('/admin');
  } catch (error) {
    req.session.message = {
      type: "danger",
      message: err.message
    }
    res.redirect("/admin");
  }
})

router.post("/delete_user", async(req, res) => {
  try {
    await User_Events.destroy({
      where: {
        UserEmail: req.body.email
      }
    })

    await User.destroy({
      where: {
        email: req.body.email
      }
    }).catch(err => {
      throw err
    })

    req.session.message = {
      type: "success",
      message: `Successfully deleted user whose email is ${req.body.email}`
    };

    res.redirect("/admin/volunteers");
  } catch (error) {
    req.session.message = {
      type: "danger",
      message: err.message
    }
    res.redirect("/admin/volunteers");
  }
})

router.get("/add_category", (req, res) => {
  res.render("admin-page/add_category")
})

router.post("/add_category", async(req, res) => {
  try{
    let hrs = req.body.hours
    await Category.create({
      minHrs: hrs
    }).catch(err => {
      throw err
    })
    req.session.message = {
      type: "success",
      message: "Successfully added a category"
    }
    res.redirect("/admin/add_category");
  }
  catch(err){
    req.session.message = {
      type: "danger",
      message: err.message
    }
    res.redirect("/admin/add_category");
  }
})

module.exports = router