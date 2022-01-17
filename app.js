//jshint esversion:6
require("dotenv").config()
const express=require("express")
const bodyParser=require("body-parser")
const ejs=require("ejs")
const mongoose=require("mongoose")
const encrypt=require("mongoose-encryption")

const app=express()
app.use(bodyParser.urlencoded({extended: false}))
app.set("view engine","ejs")
app.use(express.static("public"))
mongoose.connect ("mongodb://localhost:27017/secretsDB")


const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  // excludeFromEncryption: ["email"],
  additionalAuthenticatedFields: ["email"]
})

userSchema.plugin(encrypt,{secret: process.env.SECRET, encryptedFields: ["password"]})

const User = mongoose.model("User", userSchema)
var credentials=true

app.get("/",function(req,res){
  res.render("home.ejs")
  credentials=true
})

app.route("/register")
  .get(function(req,res){
    res.render("register.ejs")
    credentials=true
  })
  .post(function(req,res){
    User.create({
      email: req.body.username,
      password: req.body.password})
    res.render("secrets.ejs")
    credentials=true
  })

app.route("/login")
  .get(function(req,res){
    res.render("login.ejs",{credentials: credentials})
  })
  .post(function(req,res){
    User.findOne({email: req.body.username},function(err,result){
      console.log(result)
      if (result.password===req.body.password) {
        console.log(result.password)
        res.render("secrets.ejs")
        credentials=true
      } else {
        credentials=false
        res.redirect("/login")
      }
    })
  })


app.get("/logout",function(req,res){
  res.redirect ("/")
})

app.listen("3000", function(){
  console.log("Server started on port 3000")
})
