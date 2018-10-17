"use strict";
var express = require('express');
var app = express()
var router = express.Router();
module.exports = router;
var mongoose=require('mongoose');
var User=mongoose.model('User')



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
     res.render('index')
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
