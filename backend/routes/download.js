var router = require('express').Router();
const multer = require('multer');
const fileDetails = require('../models/fileDetails');
const s3 = require('../configs/s3');
const { GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

// using multer to parse the form data
const upDown = multer();
router.post('/',upDown.none(), async (req, res) => {
    try{
      const file =  await fileDetails.find({ 'shortname' : req.body.filename });

      if (file.length===0) {
        console.log('No files found');
        res.status(404).send("File not found");
      } else {

        if(file[0].password!='' && file[0].password!=req.body.password){
          res.status(401).send("File is password protected/Wrong Password.");
        }else{

          console.log("File downloaded started");

          const params = {
            Bucket: file[0].awsBucket,
            Key: file[0].awsBuckeyFileKey,
          }

          const command = new GetObjectCommand(params);
          const response = await s3.send(command);
          const downloadStream = await response.Body;

          res.set('Content-Disposition', `attachment; filename="${file[0].filename}"`);
          res.set({'Access-Control-Expose-Headers': 'Content-Disposition'});
          
          // // Streams in Node.js are objects that extend EventEmitter. They can be used to read or write data to a stream. Streams are event based and don't directly support promises.
          // // error event listener to handle errors that might occur during the streaming process. There are a few ways to handle errors for streams in Node.js. One way is to use the error event.
          // // However, it's important to note that not all stream-related operations can be directly awaited because streams are inherently asynchronous and do not return Promises.
          downloadStream.on('error', (err) => {
            console.error("Error during download stream:", err);
            res.status(500).send("Error while streaming the file");
          });

          downloadStream.pipe(res);

          downloadStream.on('end', async ()=>{
            console.log("Download ended");
            try{
              if(file[0].noOfDownload<=1){
                const data = await s3.send(new DeleteObjectCommand(params));
                // console.log("Success. Object deleted.", data);
                await fileDetails.deleteOne({ _id: file[0]._id });
              }else{
                await fileDetails.updateOne({_id:file[0]._id},{$set: {"noOfDownload": file[0].noOfDownload-1 }});
              }
            }catch(err){
              console.log('Error deleting/updating file',err);
            }
          })
          // console.log("Database info update finished");
        }
      }
    }catch(err){
      console.log("Error while downloading: ", err);
      res.status(500).send(err.message);
    }

});

module.exports = router;