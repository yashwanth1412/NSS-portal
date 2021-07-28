function check_user(req, res, next){
    if(!req.isAuthenticated())
        return res.redirect("/login")
    try{
        email = req.user.email
        if(email == process.env.Admin){
            return res.redirect("/admin")
        }
        else
            next()
    }
    catch(err){
        next(err)
    }
}

module.exports = check_user