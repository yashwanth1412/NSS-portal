const User = require("../models/user.js")

function check_admin(req, res, next){
    if(!req.isAuthenticated())
        return res.redirect("/login")
    try{
        email = req.user.email
        if(email != process.env.Admin){
            return res.redirect("/")
        }
        else
            next()
    }
    catch(err){
        next(err)
    }
}

module.exports = check_admin