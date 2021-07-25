require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");
const path = require('path')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const app = express();

const AdminRouter = require("./admin.js")

const User = require("./models/user.js")
const Event = require("./models/event.js")
const User_Events = require("./models/user_events.js")
const db_sequelize = require("./db.js");
const Category = require('./models/category.js');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: "Our little message.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(async function(user, done) {
  email = user[0].email
  await db_sequelize.sync()
  u = await User.findByPk(email)
  if(u)
    done(null, u)
  else
    done
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/index",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  async function(accessToken, refreshToken, profile, done) {
    try{
      var index = profile.emails[0].value.indexOf('@');
      await db_sequelize.sync()
      user = await User.findOrCreate({
        where: {
          email: profile.emails[0].value
        },
        defaults: {
          name: profile.displayName,
          email: profile.emails[0].value,
          rollno: profile.emails[0].value.slice(0, index)
        }
      })
      done(null, user)
    }
    catch(err){
      done(err, false)
    }
  }
));

db_sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

app.get("/auth/google",
  passport.authenticate("google", { scope: [ "email", "profile"]}
));

app.get("/auth/google/index",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    res.redirect('/');
});

app.use("/admin", AdminRouter)

app.get("/", async(req, res)=> {
  if(req.isAuthenticated()){
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
      done(err, false)
    }

    var b = a.map(entry => {
      return {
        "date" : entry.date,
        "name" : entry.name,
        "hrs" : entry.hours,
        "category" : entry.fk_category
      }
    });

    res.render("index", {list: b});
  }
  else{
    res.redirect("/login")
  }
})

app.get("/login", (req, res) => {
  if(req.isAuthenticated()){
    res.redirect("/")
  }
  else{
    res.render("login")
  }
})

app.get('/logout', function(req, res){
  console.log('logging out');
  req.logout();
  res.redirect('/login');
});

app.use((req, res, next)=>{
	const err = new Error("not found")
	err.status = 404
	next(err)
})

app.use((error, req, res, next)=>{
	res.status(error.status || 500)
	res.json({
		error: {
			message: error.message
		}
	})
})



module.exports = app
