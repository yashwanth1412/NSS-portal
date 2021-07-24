const express = require("express");
const User = require("./models/user.js")
const Event = require("./models/event.js")
const User_Events = require("./models/user_events.js")
const Category = require('./models/category.js');

const check_admin = require("./middleware/check_admin.js")

router = express.Router()

router.use(check_admin)

router.get("/", (req, res) => {
    res.send("Admin")
})

module.exports = router

