const express = require('express');
const multer = require('multer');
const assert = require('assert');
const fs = require('fs');
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const cors = require('cors');
const {GridFsStorage} = require('multer-gridfs-storage');
const { resolve } = require('path');

require("dotenv").config();

const app = express();
app.use(cors());

const server = app.listen(5000, function(){
    console.log('node server is running ...');
});

try {
    mongoose.connect(process.env.MONGO_CONN_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    });
    console.log("mongoose connected")
  } catch (error) {
    console.log("error in connection"+error)
  }

//creating bucket
let bucket;
let db;
mongoose.connection.on("connected", () => {
  db = mongoose.connections[0].db;
//   console.log(db)
  bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: "newBucket"
  });
//   console.log(bucket);
});

// Define the schema to count number of file that has been served
const countSchema = new mongoose.Schema({
  identifier : { type: String, unique: true, default: 'countFileServed' },
  count: { type: Number, default: 0 }
});

// Create the model for the count number of number of file that has been served
const fileNo = mongoose.model('fileNo', countSchema);

const generateShortName = (sitesCount) => {
  var count=sitesCount;
  var string='';
  while(count>0){
      // console.log(count, count%26,String.fromCharCode(97 + count%26));
      string= string.concat(String.fromCharCode(97 + count%26));           // ascii value of a is 97
      count=Math.floor(count/26);
  }

  return string;
};


const hashName = async () => {

    const options = {
      upsert: true, // Create the document if it doesn't exist
      new: true     // Return the updated document
    };

    // Update the count
    let doc = await fileNo.findOneAndUpdate(
      { identifier: 'countFileServed' },
      { $inc: { count: 1 } },
      options
    )
    
    console.log("Number of file serverd is: " + doc.count);
    return generateShortName(doc.count);

}


const storage = new GridFsStorage({
    url: process.env.MONGO_CONN_URL,
    file: (req, file) => {
      return new Promise( async (resolve, reject) => {
        const filename = file.originalname;
        const shortname = await hashName();
        console.log("Short name returned is: "+shortname);
        const fileInfo = {
          filename: filename,
          metadata:{
            shortname: shortname
          },
          bucketName: "newBucket"
        };
        resolve(fileInfo);
      });
    }
  });

  const upload = multer({
    storage
  });
  

// mongoose.connect(process.env.MONGO_CONN_URL).then(()=>{
//     console.log("mongodb connected")
// }).catch((err)=>{
//     console.log('Connection failed');
//     console.log(err);
// });




// const upload = multer({dest: './uploads/'});

// app.get('/',(req,res)=>{
//     res.send('<html><body><h1>Hello</h1></body></html>');
// });

app.post('/upload',upload.single("fileUpload"),async (req,res)=>{

    const file = req.file;
    // console.log(file);
    // console.log(file.metadata.shortname);
    // const count = await bucket.find({}).toArray();
    // console.log(count.length);
    
    console.log("File has been uploaded. File name is: "+file.metadata.shortname);
    res.send(file.metadata.shortname)

});

app.get('/download', async (req, res) => {
  
    const cursor = bucket.find({ 'metadata.shortname' : req.query.filename });
    const files = await cursor.toArray();

    console.log("File info of requested file: ");
    console.log(files);

    if (files.length === 0) {
        console.log('No files found');
        res.status(404).send("File not found");
    } else {
        const filename = files[0].filename;
        // console.log(filename);
        const downloadStream = bucket.openDownloadStreamByName(filename);
        res.set('Content-Disposition', `attachment; filename="${filename}"`);
        res.set({'Access-Control-Expose-Headers': 'Content-Disposition'});     // https://stackoverflow.com/a/71195901
        downloadStream.pipe(res);
    }

 });


// app.get('/download',(req,res)=>{
//     // res.send("Download requet recieved");
//     // const file = bucket.find({
//     //   filename: req.query.filename
//     // })
//     // .toArray((err, files) => {
//     //   if (!files || files.length === 0) {
//     //     return res.status(404)
//     //       .json({
//     //         err: "no files exist"
//     //       });
//     //     }else{
//     //         bucket.openDownloadStreamByName(req.query.filename)
//     //         .pipe(res);
//     //     }
//     // });

//     // console.log("\n Here is the file info \n ---------------------- \n");
//     // console.log(file);


//     // console.log(req.query.filename)
//     // const file = bucket
//     // .find({
//     //   filename: req.query.filename
//     // })
//     // .toArray((err, files) => {
//     //     console.log(files);
//     //   if (!files || files.length === 0) {
//     //     return res.send("file not found")
//     //   }
//     //   bucket.openDownloadStreamByName(req.query.filename)
//     //     .pipe(res);
//     // })
// });

