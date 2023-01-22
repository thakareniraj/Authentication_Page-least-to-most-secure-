//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const md5 =require("md5");
const mongoose = require('mongoose');
// const bcrypt=require("bcrypt");
// const saltRounds =10 ;
const session =require("express-session")
const passport=require("passport")
const passportLocalMongoose =require("passport-local-mongoose")
// var encrypt  =require("mongoose-encryption")


const app = express();

app.set('view engine', 'ejs');



app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public")); 

app.use(session({
  secret:"ourbloodysecret",
  resave: false,
  saveUninitialized : true,
  // cookie: { secure: true }
}))

app.use(passport.initialize())
app.use(passport.session());

console.log(process.env.API_KEY)
// const secret ="this is secret"
// console.log(secret)
console.log(process.env.SECRET)
mongoose.set('strictQuery',true);
mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser : true})
 
const userSchema =new mongoose.Schema({
  email:String,
  password:String
})

userSchema.plugin(passportLocalMongoose)

const User =new mongoose.model("User",userSchema)
// userSchema.plugin(encrypt, { secret: process.env.SECRET ,encryptedFields: ["password"] });

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//TODO

app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login")
});

app.get("/register",function(req,res){
  res.render("register");
});

app.get("/secrets",function(req,res){
      if(req.isAuthenticated()){
        res.render("secrets")
      }else{
        res.redirect("/login");
      }
})

app.get("/logout",function(req,res){
  req.logout(function(err){
    if(err){
      console.log(err)
    }else{
        
      res.redirect("/")
    }
  })
})

app.post("/register",function(req,res){


  User.register({username:req.body.username},req.body.password,function(err,user){
    if(err){
      console.log(err)
      res.redirect("/")
    }else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets")
      })

    }
  })

  // bcrypt.hash(req.body.password,saltRounds,function(err,hash){
  //   const newUser =new User({
  //     email: req.body.username,
  //     password:hash
  //   })
  //     newUser.save(function(err){
  //   if(!err){
  //     res.redirect("/");
  //   }else{
  //     res.send("unable to add to the server");
  //   }
  // })
  })
  


  // res.redirect("/")
  // res.render("register");
// });

app.post("/login",function(req,res){
     const user = new User({
      username:req.body.username,
      password:req.body.password
     });

     req.login(user,function(err){
      if(err){
        console.log("while logging we got error mate")
      }else{
        passport.authenticate("local")(req,res ,function(){
          res.redirect("/secrets")
        })
        res.redirect("/secrets");
      }
     })



  // res.redirect("/")
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
})