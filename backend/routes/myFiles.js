var router = require('express').Router();
const jwt = require('jsonwebtoken');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const fileDetails = require('../models/fileDetails');
const s3 = require('../configs/s3');
require("dotenv").config();

router.get("/", async(req,res) => {
    if(req.cookies===undefined || req.cookies.pass===undefined){
      res.send([]);
    }else{
      const token = req.cookies.pass;
      try{
        const payload=jwt.verify(token,process.env.JWT_PRIVATE_KEY);
        const mailId = payload.userId;
  
        const files = await fileDetails.find({'uploadedBy': mailId});
        var myFiles=[];
        for(var i=0;i<files.length;++i){
          // console.log(files[i]);
          if(Date.parse(files[i].expiryTime)<=Date.now()){
      
            try{
  
              // comment below if deleting file in amazon s3 through lifecycle management
              const data = await s3.send(new DeleteObjectCommand({
                Bucket: files[i].awsBucket,
                Key: files[i].awsBuckeyFileKey,
              }));
              // console.log("Success. Object deleted.", data);
  
              await fileDetails.deleteOne({ _id: files[i]._id });
            }catch(err){
              console.log('Error updating expired files in public files',err);
            }
            
          }else{
            delete(files[i]._id);
            delete(files[i].awsBucket);
            delete(files[i].awsBuckeyFileKey);
            myFiles.push(files[i]);          
          }
        }
        console.log("Number of my files are: "+myFiles.length);
        res.status(200).send(myFiles);
        
      }catch(err){
        res.send([]);
      }
  
    }
  
});

module.exports = router;