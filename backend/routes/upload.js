var router = require('express').Router();
const fileDetails = require('../models/fileDetails');
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('../configs/s3');
const jwt = require('jsonwebtoken');
const hashName = require('../utils/hashName');
require("dotenv").config();

const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.AWS_BUCKET_NAME,
      // // can use aws s3 lifecycle leverage to automatically 
      // // delete file on time expiry: haven't setup in this, 
      // // in this manually delete when needed
      // metadata: function (req, file, cb) {
      //   // console.log(req.body.expiryTime);
      //   cb(null,{expiry: req.body.expiryTime});
      // }
    }),
}).single("fileUpload");
  
router.post('/',(req,res)=>{
    console.log("File upload started");
    upload(req, res, async (error) => {
    if(error){
        console.log(req.body.expiryTime);
        console.log("Error while uploading file");
        res.send("Error while uploading file");
    }else{

        var uploadedBy = 'anonymous';
        if(req.cookies!==undefined && req.cookies.pass!==undefined){
        try{
            const token = req.cookies.pass;
            const payload=jwt.verify(token,process.env.JWT_PRIVATE_KEY);
            uploadedBy = payload.userId;
        }catch(err){
            console.log('Upload catch block executed');
        }
        }

        // console.log(req);
        
        const newFileDetails = new fileDetails({
            filename: req.file.originalname,
            size: req.headers['content-length'],
            shortname: await hashName(),
            expiryTime: new Date(req.body.expiryTime),
            noOfDownload: parseInt(req.body.noOfDownload),
            isPublic: req.body.isPublic==='true',
            password: req.body.password,
            uploadedBy: uploadedBy,
            // awsS3Link: req.file.location,
            awsBucket: req.file.bucket,
            awsBuckeyFileKey: req.file.key,
        });

        try {
            await newFileDetails.save();
                console.log('File uploaded successfully! File id: '+ newFileDetails.shortname);
                res.send(newFileDetails.shortname);
            } catch (err) {
            console.error(err);
            console.log('Error while saving info in db');
            res.status(500).send('Error while saving uploaded file');
        }
    }
    })
});

module.exports = router;