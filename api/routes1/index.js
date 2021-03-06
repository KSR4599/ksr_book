"use strict";
var express = require('express');
var app = express()
var router = express.Router();
module.exports = router;
var cookieParser = require('cookie-parser')
var session = require('express-session')
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

//====================================
//cookieParser
app.use(cookieParser());
// Init passport authentication
app.use(passport.initialize());
// persistent login sessions
app.use(passport.session());




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

var user = req.user;
var id = user._id;
User
  .findById(id)
  .select('social.friend_names')                        // User.find({_id: userId },{'library.story'}).then(function(user){
  .exec(function(err,doc){
    var response = {
         status : 200,
         message : []
       };
       if (err) {
         console.log("Error finding service");
         response.status = 500;
         response.message = err;
       } else if(!doc) {
         console.log("User id not found in database", id);
         response.status = 404;
         response.message = {
           "message" : "User ID not found " + id
         };
       } else {
         response.message = doc.services ? doc.services : [];
       }
       console.log(user.social)
       res
         .status(response.status)
         .render('friends',{frends:doc,user:user.social})
});
})




//==================PEOPLE rendering============================
router.get('/people',function(req,res){

var user = req.user;
var i=0,j=0,n=parseInt(user.friends);
var usr = req.user.name;
var doc1 =user.social;

User.find({ name: { $ne: usr }},'-_id -name -password -email -friends -social -__v',function(err, doc) {

console.log(n)

var no =[];
for(i=0;i<doc.length;i++){
  var flag=0;
  for(j=0;j<n;j++){
  if((doc[i].username)==doc1[j].friend_names){
    flag=1;
  }
}
if(flag==0){
  no.push(i)
}
}
console.log(no.length)
var picdox =[];
var namedox =[];

var docpics =[];
for(i=0;i<no.length;i++){
  var x =no[i]

  console.log(doc[x].profileimage)
  picdox.push(doc[x].profileimage)
  console.log(doc[x].username)
  namedox.push(doc[x].username)
}
console.log(namedox)
console.log(picdox)
var nu=3;
res.render('sample',{name:namedox,pic:picdox,nu:nu})
})

})




  //======================END OF PEOPLE RENDERING====================



//====================FREIND REQUEST==========================

router
  .route('/friendreq')
  .get(ctrlUsers.friendReqshow)
  .post(ctrlUsers.friendReq)


//========================================================

router.post('/chat',function(req,res){
  var user = req.user;
  var userid=user._id;
  var username=user.name;
  var frname = req.body.frname;
    var frpic = req.body.frpic;
  User
   .findOne({name:frname})
   .exec(function(err,doc){
    var frid=doc._id;
      res.render('chat',{userid:userid,username:username,frname:frname,frid:frid,frpic:frpic})
   })


})
//======================UNFRIEND=========================================

var delotherfriend = function(req, res,user){
  var frname= req.body.frname;
  var user=req.user
      var i=0,j=100;

  User.findOne({name:frname}).exec(function(err,doc){
    var fff= parseInt(doc.friends);
    doc.friends =fff-1;
      doc.save(function(err, docUpdated) {});
  })

  User
   .findOne({name:frname})
   .select('social')
   .exec(function(err,doc){



     var doc = doc.social;
          console.log(doc)

          for(i=0;i<100;i++){
            if(doc[i].friend_names==user.name){
              console.log(doc[i].friend_names)
              console.log(doc[i].friend_pics)
                console.log(doc[i]._id)
                var frn=doc[i].friend_names;
                var frnid=doc[i]._id;
              break;
            }
          }



 console.log(doc)

 User.findOne({name: frname}, function (err, result) {
         result.social.id(frnid).remove();
         result.save();
     });
res.render('index')
})
   };




router.post('/unfriend',function(req,res){
  var user=req.user;
  var frname=req.body.frname;
  var ff=parseInt(user.friends);
  user.friends = ff-1;
  user.save();
    var i=0,j=100;

    User
     .findOne({name:user.name})
     .select('social')
     .exec(function(err, doc){
       var doc = doc.social;
            console.log(doc)

            for(i=0;i<100;i++){
              if(doc[i].friend_names==frname){
                break;
              }
            }
              var socialid =doc[i]._id;
              User.findOne({name: user.name}, function (err, result) {
                      result.social.id(socialid).remove();
                      result.save();
                  });
                  console.log(user)
                })
                delotherfriend(req,res,user)
})



//====================================================================

//=====================ESNURE AUTH=====================
//ENSURE AUNTHENTICATION FUNCTION
function ensureAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.render("errorauth");
}
