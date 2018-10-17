
var mongoose = require('mongoose');
var bcrypt=require('bcryptjs')

var socialSchema = new mongoose.Schema({
  friend_names:[String],
  friend_pics:[String],
  friend_id:[String],
  friend_requests:[String],
  friend_req_profilepic:[String]

})


var userSchema= new mongoose.Schema({
    name: {
      type: String,
    },
    username: {
      type: String,
      index:true
    },
    email: {
      type: String,
    },
    password: {
      type: String,

    },

      profileimage:{
        type:String
    },

    friends:{
      type:Number
    },

    social:[socialSchema],
    google :{
      id: String,
      token: String,
      email: String,
      name: String
    }


  })

var User=module.exports=mongoose.model('User',userSchema);

module.exports.getUserById = function(id, callback){
  User.findById(id, callback);
}

module.exports.getUserByUsername = function(username, callback){
  var query = {username : username};
  User.findOne(query, callback);
}

module.exports.comparePassword = function(candidatePassword,hash,callback){
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {

  callback(null,isMatch);
});
}


module.exports.createUser = function(newUser,callback){
 bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
      newUser.password=hash;
      newUser.save(callback);
    });
});

}
