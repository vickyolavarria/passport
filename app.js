var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require("express-session");
var passport = require("passport")
var LocalStrategy = require("passport-local").Strategy
var FacebookStrategy = require("passport-facebook").Strategy

var logger = require('morgan');
var User = require('./models/users')


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(
  session({
    secret: "cats",
    saveUninitialized: true,
    resave: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler

passport.use(
  new LocalStrategy({usernameField: 'email'}, function (inputEmail, password, done) {
    User.findOne({where: {email:inputEmail}})
    .then(user => {
      if(!user){
        return done(null,false,{message:'incorrect username'})
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: "Incorrect password." });
      }
      return done(null, user);
    })
    .catch(done)
  })
)
  
passport.use(
  new FacebookStrategy(
    {
      clientID: "712700209532501",
      clientSecret: "5835a058cea57e1f6feb092915060c0c",
      callbackURL: "http://localhost:3000/auth/facebook/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      User.findOrCreate({ where: { email: profile.displayName, password: profile.id } })
      .then((user) => done(null, user))
    }
  )
)


passport.serializeUser(function(user,done){
  done(null,user)
})

passport.deserializeUser(function(id,done){
  console.log(id)
User.findOne({where: {email: id[0].email}})
.then((user)=>done(null,user))
})

app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
