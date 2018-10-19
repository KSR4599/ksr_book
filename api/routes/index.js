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



//multer conf for profile pic

const multerConf = {
  storage : multer.diskStorage({
    destination : function(req, file, next){
      next(null,'../ksr_book/views/images/profilepics');
    },
  filename: function(req, file, next){
    const ext = file.mimetype.split('/')[1];
    var user=Date.now();
    //next(null,file.fieldname + '-'+ Date.now()+'.'+ext);
    next(null,user+'prof'+'.'+ext);
  }

  }),
  fileFilter: function(req, file, next){
    if(!file){
      next();
    }
    const image= file.mimetype.startsWith('image/');
    if(image){
      next(null, true);
    }else{
      next({message: "File type not supported"},false);
    }
  }
};

// ROOT RENDER
router.get('/',function(req, res){
  res.render('index')
})

//LOGIN RENDER
router.get('/login',function(req,res){
  res.render('login')
})

//REGISTER RENDER
router.get('/register',function(req,res){
  res.render('register')
})

//REGISTER POST FUNCTION
router.post('/register',multer(multerConf).single('profileimage'),function(req, res,next){

  var name= req.body.name;
  var email = req.body.email;
  var username=req.body.username;
  var password=req.body.password;
  var password2=req.body.password2;
  var friends=0;


  User.findOne({ 'email': req.body.email}, function(err, user) {
    if(user){
      res.render('register',{x:3});
    }
    else{



  if(req.file){
    console.log('Profile Pic Uploaded');
    var profileimage = req.file.filename;
  }else{
    console.log('No Profile pic Uploaded');
    var profileimage ='nopic.jpeg';
  }

  //form validation
  req.checkBody('password2','passwords do not match'). equals(req.body.password);
  //Check Errors
  var errors=req.validationErrors();
if(password!==password2){
  res.render('register',{
    errors:'Passwords Do not match!'
  });
}
  else{

    var newUser = new User({
      username:username,
      name: name,
      email:email,
      password:password,
      profileimage:profileimage,
      friends:friends
    })
    User.createUser(newUser,function(err, user){
      if(err) throw err;
      console.log(user);

    })


    //nodemailer
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'killershell9@gmail.com', // generated ethereal user
            pass:  'KSRKILL459945'// generated ethereal password
        },
        tls:{
          rejectUnauthorized:false
        }
    });

    let mailOptions = {
    from: '"KSR🔥" <killershell9@gmail.com>', // sender address
    to: email, // list of receivers
    subject: ' 💬 KSR_BOOK Registration Succesful',
    html: '<p>Thankyou for registering with us! Now you can login to your account and Start Socializing!😎</p>'

    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    });

    //req.flash('Success:-', 'You are now registered and can Login!',false);
    // res.redirect('/api/login');
    res.render('login',{x:1});

}
}


})

})


//LOGIN POST
router.post('/login',
passport.authenticate('local',{failureRedirect:'/api/wronglogin'}),
function(req, res, next){
 res.redirect('/api/');

});


passport.serializeUser(function(user, done) {
       return done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
      return done(err, user);
});
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.getUserByUsername(username,function(err,user){

      if(err) {return done(err);}

      if(!user){
        console.log("No user found");
         return done(null,false,{message:'Unknown User!'});
        }

      User.comparePassword(password,user.password,function(err,isMatch){
        if(err) {return done(err); }

        if(isMatch){
       console.log("User Found!")
              return done(null,user);
        }
          else {
              return done(null, false, {
                  message: "Invalid password"})

           //return done(null,false)
         }
         })
})

}));

//=========================ACCEPT FRIEND ROUTE =============
router
  .route('/acceptfriend')
  .post(ctrlUsers1.friendAccept)

//=========================ACCEPT FRIEND ROUTE END===========


//ENSURE AUNTHENTICATION FUNCTION
function ensureAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.render("errorauth");
}
