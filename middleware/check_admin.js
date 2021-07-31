async function check_admin(req, res, next){
    if(!req.isAuthenticated())
        return res.redirect("/login")
    try{
        email = req.user.email
        if(email != process.env.ADMIN){
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