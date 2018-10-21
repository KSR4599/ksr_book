"use strict";
var express = require('express');
var app = express()
var router = express.Router();
module.exports = router;
var mongoose=require('mongoose');
var User=mongoose.model('User')
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
app.use(passport.initialize());
app.use(passport.session());
var cookieParser = require('cookie-parser')
var session = require('express-session')

//====================================
//cookieParser
app.use(cookieParser());
// Init passport authentication
app.use(passport.initialize());
// persistent login sessions
app.use(passport.session());

//========================FRIEND REQ HANDLING=========================
module.exports.friendReq = function(req, res){
  var user = req.user;
var requser = req.body.requser;
var requserpic = user.profileimage;


User
 .findOne({name:requser})
 .select('social')
 .exec(function(err,doc){
   //console.log(doc)
   doc.social.push({
     friend_requests:user.username,
     friend_req_profilepic:requserpic
   })

   doc.save(function(err, docUpdated) {
   if (err) {
     res
       .status(500)
       .json(err);
   } else {
     console.log(docUpdated)
     res.redirect('/api')
   }
 });
})
}
//========================FRIEND REQ HANDLING END=========================



//========================FRIEND REQ SHOW START================================

module.exports.friendReqshow = function(req, res){
    var user=req.user;

    /*
    User
    .find({ name:user.name})
    .select('social')
    .exec(function(err, doc) {
      //doc=doc.social
        console.log(doc);
      res.render('friendreqs',{doc:doc})
      })
      */
      User.find({},'-_id',function(err, users) {
        users=JSON.stringify(users);
        User.aggregate([
      {"$project":{
        "array":{
        "$map":{
        "input":{"$range":[0,{"$size":"$social.friend_requests"}]},
        "as":"ix",
        "in":{
         "RequestArray":{"$arrayElemAt":["$social.friend_requests","$$ix"]},
         "PicArray":{"$arrayElemAt":["$social.friend_req_profilepic","$$ix"]}}
      }
    }
  }},
  {"$unwind":"$array"},
  {"$replaceRoot":{"newRoot":"$array"}}
],function(err, output){
    console.log(output);

    res.render('friendreqs',{output:output})
  })

})

}




//========================FRIEND REQ SHOW END=========================
