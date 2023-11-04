var router = require('express').Router();
const multer = require('multer');
const jwt = require('jsonwebtoken');
const otp = require('../models/otp');
const users = require('../models/users');
require("dotenv").config();

router.post("/",multer().none(), async (req,res) => {
    const {mail,password,otpValue} = req.body;
    const sentOtp = await otp.findOne({email: mail});
    try{
      if(sentOtp!==null && !isNaN(otpValue) && sentOtp.otp===parseInt(otpValue) && password.length!=0){
        await users.findOneAndUpdate({email: mail},{email: mail,password: password},{upsert: true});
        console.log("User created/password reseted successfully");
  
        // jwt token parameters
        const payload = {
          userId: mail
        }
        const options = {
          expiresIn: '7d'
        }
        // create token
        const token = jwt.sign(payload, process.env.JWT_PRIVATE_KEY, options);
  
        // storing token as a cookie
        const cookieOptions = {
          httpOnly: true,
          maxAge: 7*24*60*60*1000
        }
        res.cookie('pass',token,cookieOptions);
        res.cookie('mail',mail,{maxAge: 7*24*60*60*1000});
  
        res.status(200).send("User created/password reseted successfully");
      }else{
        console.log("Wrong otp");
        res.status(401).send("Wrong otp");
      }
    }catch(err){
      res.status(500).send(err);
    }
});

module.exports = router;  