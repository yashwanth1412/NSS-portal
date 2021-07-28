const express = require("express");
const User = require("../models/user.js")
const Event = require("../models/event.js")
const User_Events = require("../models/user_events.js")
const db_sequelize = require("../db.js");
const Category = require('../models/category.js');

const check_user = require("../middleware/check_user.js");

router = express.Router()

router.use(check_user)

router.get("/", async(req, res, next)=> {
    if(!req.isAuthenticated()){
        return res.redirect("/login")
    }
    try {
        await db_sequelize.sync()
        var a = await User_Events.findAll({
        where: {
            UserEmail: req.user.email
        },
        include: Event
        })
        a = a.map(events => {
        return {...events.Event.dataValues, ...events.dataValues};
        })
    } catch(err) {
        next(err)
    }

    try {
        var cats = await Category.findAll()
        cats = cats.map(cat => {
        return {...cat.dataValues};
        })
    } catch {
        err = new Error()
        next(err)
    }

    var sample = {};
    cats.forEach((cat, i) => {
        sample[cat.number] = {
            minhrs: cat.minHrs,
            hrs: 0
        }
    });

    var b = a.map(entry => {
        return {
        "date" : entry.date,
        "name" : entry.name,
        "hrs" : entry.hours,
        "category" : entry.fk_category
        }
    });

    var agg_hrs = 0;
    a.forEach((data, i) => {
        agg_hrs += data.hours;
        sample[data.fk_category].hrs += data.hours;
    });


    var info = {
        "name" : req.user.name,
        "mail" : req.user.email,
        "hrs" : agg_hrs
    };

    res.render("index", {list: b, info: info, cwhrs: sample});
})

module.exports = router