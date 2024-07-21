var router = require('express').Router();
const multer = require('multer');
const jwt = require('jsonwebtoken');
const users = require('../models/users');
const bcrypt = require('bcrypt');
require("dotenv").config();

router.post("/",multer().none(), async (req,res) => {
    const {mail, password} = req.body;
    try{
      const user = await users.findOne({email: mail});
      const match = await bcrypt.compare(password, user.password);
      if(user===null){
        res.status(404).send("User not found");
      }else if(!match){
        res.status(401).send("Incorrect Password"); 
      }else{
  
        // jwt token parameters
        const payload = {
          userId: mail
        }
        const options = {
          expiresIn: '7d'                              // token expire in 7 days
        }
        // create token
        const token = jwt.sign(payload, process.env.JWT_PRIVATE_KEY, options);
  
        // storing token as a cookie
        const cookieOptions = {
          httpOnly: true,
          maxAge: 7*24*60*60*1000                      // cookie expire in 7 days
        }
        res.cookie('pass',token,cookieOptions);
        res.cookie('mail',mail,{maxAge: 7*24*60*60*1000});
  
        res.status(200).send("Login Successfull");
  
      }
    }catch(err){
      console.log(err);
      res.status(500).send(err);
    }
  
});

module.exports = router;