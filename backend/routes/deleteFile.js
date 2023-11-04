var router = require('express').Router();
const jwt = require('jsonwebtoken');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const fileDetails = require('../models/fileDetails');
const s3 = require('../configs/s3');
require("dotenv").config();

router.get("/", async (req,res) => {
    console.log("Delete file request received");
    if(req.cookies===undefined || req.cookies.pass===undefined){
      res.send("Unauthorised");
    }else{
      const token = req.cookies.pass;
      try{
        jwt.verify(token,process.env.JWT_PRIVATE_KEY);
        const fileId = req.query.fileId;
        
        const file = await fileDetails.find({'shortname': fileId});
  
        // comment below if deleting file in amazon s3 through lifecycle management
        const data = await s3.send(new DeleteObjectCommand({
          Bucket: file[0].awsBucket,
          Key: file[0].awsBuckeyFileKey,
        }));
        // console.log("Success. Object deleted.", data);
        await fileDetails.deleteOne({ _id: file[0]._id });
  
        console.log("File deletion successfull");
        res.status(200).send("File Deleted");
        
      }catch(err){
        console.log(err.message);
        res.send("Unable to delete file");
      }
    }
});

module.exports = router;