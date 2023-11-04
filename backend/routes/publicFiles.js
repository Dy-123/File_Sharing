var router = require('express').Router();
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const fileDetails = require('../models/fileDetails');
const s3 = require('../configs/s3');

router.get("/", async (req,res) => {

    const files = await fileDetails.find({});
    var publicFiles=[];
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
        
      }else if(files[i].isPublic){
        delete(files[i]._id);
        delete(files[i].awsBucket);
        delete(files[i].awsBuckeyFileKey);
        publicFiles.push(files[i]);
      }
    } 
    console.log("Number of public file send is: "+publicFiles.length);
    res.status(200).send(publicFiles);
});

module.exports = router;