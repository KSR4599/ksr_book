"use strict";
var express = require('express');
var app = express()
var router = express.Router();
module.exports = router;
var mongoose=require('mongoose');
var User=mongoose.model('User')

var addotherfriend = function(req, res,user){
  var frname= req.body.username;
  var user=req.user
  User.findOne({name:frname}).exec(function(err,doc){
    var fff= parseInt(doc.friends)
    doc.friends =fff+1;
      doc.save(function(err, docUpdated) {});
  })

  User
   .findOne({name:frname})
   .select('social')
   .exec(function(err,doc){

     doc.social.push({
       friend_names:user.name,
       friend_pics:user.profileimage
     })

     doc.save(function(err, docUpdated) {
     if (err) {
       res
         .status(500)
         .json(err);
     } else {
       console.log(docUpdated)
    //====================================
    User.find({name:user.name},'-_id',function(err, users) {
      users=JSON.stringify(users);
      User.aggregate([
    {"$project":{
      "array":{
      "$map":{
      "input":{"$range":[0,{"$size":"$social.friend_names"}]},
      "as":"ix",
      "in":{
       "FriendArray":{"$arrayElemAt":["$social.friend_names","$$ix"]},
       "PicArray":{"$arrayElemAt":["$social.friend_pics","$$ix"]}}
    }
  }
}},
{"$unwind":"$array"},
{"$replaceRoot":{"newRoot":"$array"}}
],function(err, output){
  console.log(output);

  res.render('friends',{output:output})
})

})
//=========================================================
     }
   });
   })
}


module.exports.friendAccept= function(req, res){
  var frname= req.body.username;
  var frpic = req.body.userpic;
  var user= req.user;
  var ff=parseInt(user.friends);
  user.friends = ff+1;
  console.log("NAME",frname)
  console.log("PIC",frpic)
  var i=0,j=100;

  User
   .findOne({name:user.name})
   .select('social')
   .exec(function(err, doc){
     var doc = doc.social;
          console.log(doc)

          for(i=0;i<100;i++){
            if(doc[i].friend_requests==frname){
              break;
            }
          }
            var socialid =doc[i]._id;

                var thisSocial = user.social.id(socialid);
                thisSocial.friend_names = frname;
                thisSocial.friend_pics= frpic;
                thisSocial.friend_requests = undefined;
                thisSocial.friend_req_profilepic = undefined;

                user.save(function(err, user) {
                  if (err) {
                    res
                      .status(500)
                      .json(err);
                  } else {
                    //res.render('friends')
                    addotherfriend(req,res,user)
                  }
                });
                console.log(user)
              })

   }





    /*
    var socialid = '5bc73e145d2a2d3808f3cd71';

    var thisSocial = user.social.id(socialid);
    thisSocial.friend_names = frname;
    thisSocial.friend_pics= frpic;
    thisSocial.friend_requests = undefined;
    thisSocial.friend_req_profilepic = undefined;

    user.save(function(err, user) {
      if (err) {
        res
          .status(500)
          .json(err);
      } else {
        res.render('friends')
      }
    });
    console.log(user)
  })
  */
