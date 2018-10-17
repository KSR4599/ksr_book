"use strict";
var express = require('express');
var app = express()
var router = express.Router();
module.exports = router;
var mongoose=require('mongoose');
mongoose.set('useCreateIndex', true);
const multer = require('multer');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
app.use(passport.initialize());
app.use(passport.session());
const nodemailer = require('nodemailer')
var User=mongoose.model('User')
var ctrlUsers = require('../controllers/users.controllers.js');
var ctrlUsers1 = require('../controllers/users1.controllers.js')


//LOGOUT ROUTE
router.get('/logout',function(req,res,next){
  req.logout();
  res.redirect('/api/login');
})


//PROFILE ROUTE
router.get('/profile',function(req,res,next){
  var user = req.user;
  res.render('profile',{user:user});
})

//FRIENDS ROUTE
router.get('/friends',function(req,res){

  res.render('friends')
})




//==================PEOPLE rendering============================
router.get('/people',function(req,res){

var usr = req.user.name;
//extractng every user except the current user ( all the fields except the fiels mentiones with negation "-")
User.find({ name: { $ne: usr }},'-_id -name -password -email -friends -social -__v',function(err, users) {

    console.log(users);

      res.render('people',{output:users})


  })

})


  //======================END OF PEOPLE RENDERING====================



//====================FREIND REQUEST==========================

router
  .route('/friendreq')
  .get(ctrlUsers.friendReqshow)
  .post(ctrlUsers.friendReq)


//========================================================
