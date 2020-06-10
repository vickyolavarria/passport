var express = require('express');
var router = express.Router();
var User = require('../models/users')
var passport = require('passport')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/register', function (req,res,next){
  res.render('register', { title: 'Register' });
})

router.get('/login', function (req, res, next) {
  res.render('login', { title: 'Login' });
})

router.get("/public", function (req, res, next) {
  res.render("index", { title: "Pagina Publica" });
});

router.get("/private", isLoggedIn, function (req, res, next) {
  res.render("index", { title: "Pagina Privada" });
});

router.get("/logout", function (req, res, next) {
  req.logout();
  res.render("index", { title: "Log Out" });
});

router.post('/register', function (req, res, next) {
  User.create({email: req.body.email, password: req.body.password})
  .then(() => res.redirect('/login'))
})

router.post("/login", passport.authenticate('local'), function (req, res, next) {
res.status(200).redirect("/private")
})

router.get("/auth/facebook", passport.authenticate("facebook"));

router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/private",
    failureRedirect: "/login",
  })

)

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    next()
  } else {
    res.status(401).redirect('/login')
  }
}

module.exports = router;
