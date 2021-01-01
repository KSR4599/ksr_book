require('./api/data/db.js');
var express = require('express')
var app = express()
var favicon = require('serve-favicon');
var expressValidator = require('express-validator');
var path= require('path')
var bodyParser= require('body-parser')
var hbs = require('express-handlebars')
var cookieParser = require('cookie-parser')
var session = require('express-session')
var mongo = require('mongodb')
var mongoose = require('mongoose')
const MongoStore = require('connect-mongo')(session);
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
var multer = require('multer')
var bcrypt=require('bcryptjs')
var asy = require("async");
var routes = require('./api/routes')
var routes1 = require('./api/routes1')
const nodemailer = require('nodemailer')
var socket = require('socket.io')



//the middleware use() function of express for serving static files.
app.use(express.static(path.join(__dirname,'views')))
app.get('/', function(req, res){
  res.render('index');

});


//cookieParser
app.use(cookieParser());


//session
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  store: new MongoStore({url: 'mongodb://localhost:27017/ksr_book'}),
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 600000  }
}))

// Init passport authentication
app.use(passport.initialize());
// persistent login sessions
app.use(passport.session());


app.get('*',function(req,res,next){
  res.locals.user=req.user||null;
  next();
})

// Express Validator Middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value){
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;

    while(namespace.length){
        formParam += '[' + namespace.shift() + ']';
    }
    return {
        param : formParam,
        msg   : msg,
        value : value
    };
  }
  }));




//setting the port
app.set('port',3000)


//passport middleware
app.use(passport.initialize());
app.use(passport.session());




//temp engine
app.engine('hbs',hbs({extname:'hbs',defaultLayout: 'layout1', layoutsDir:__dirname + '/views/layouts'}));
app.set('views', path.join(__dirname,'views'));
app.set('view engine','hbs');

//bodyparser for posting the form related Data
app.use(bodyParser.urlencoded({ extended : false}))





//if a request starting with /api occurs it searches automatically in the routes folder.
app.use('/api',routes)
app.use('/api1',routes1)


//making use of variable to configure the server properties..
var server = app.listen(app.get('port'),function(){
  var port = server.address().port;
  console.log('Express server listening on port ' + port)
})

var io = socket(server);
io.on("connection",function(socket){
  socket.on("attach_user_info",function(user_info){
    socket.member_id = user_info.member_id;
    socket.user_name=user_info.user_name;
    //console.log("socket",socket);
  })

  socket.on("message_from_client",function(usr_msg){
    var all_connected_clients =io.sockets.connected;
    for(var socket_id in all_connected_clients){
      if(all_connected_clients[socket_id].member_id===usr_msg.friend_member_id){
        var message_object ={"msg":usr_msg.msg,"user_name":socket.user_name};
        all_connected_clients[socket_id].emit("message_from_server",message_object);
        break;
      }
    }
  })




})
