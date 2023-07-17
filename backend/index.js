const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const {GridFsStorage} = require('multer-gridfs-storage');
const bodyParser = require('body-parser');

require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));    // Parse URL-encoded bodies (form data)

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
    
    // console.log("Number of file serverd is: " + doc.count);
    return generateShortName(doc.count);

}


const storage = new GridFsStorage({
    url: process.env.MONGO_CONN_URL,
    file: (req, file) => {
      return new Promise( async (resolve, reject) => {

        const filename = file.originalname;
        const shortname = await hashName();
        // console.log("Short name returned is: "+shortname);

        console.log(req.body);

        // Setup body-parser for accessing form data in req.body using . notation
        const expTime = new Date(req.body.expiryTime);
        const noOfDown = parseInt(req.body.noOfDownload);
        const isPublic = req.body.isPublic==='true';

        // console.log(req.body.isPublic==='true', req.body.isPublic);

        // backend validation (ignore for now)
        // if(!isNaN(expTime) || !isNaN(noOfDown)){
        //   reject("Invalid input");
        // }

        const fileInfo = {
          filename: filename,
          metadata:{
            shortname: shortname,
            expiryTime: expTime,
            noOfDownload: noOfDown,
            isPublic: isPublic
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

// app.get('/',(req,res)=>{
//     res.send('<html><body><h1>Hello</h1></body></html>');
// });

app.post('/upload',upload.single("fileUpload"),async (req,res)=>{

    const file = req.file;
    // console.log(file);
    // console.log(file.metadata.shortname);
    // const count = await bucket.find({}).toArray();
    // console.log(count.length);

    // backend validation (ignore for now)
    // if(file===undefined){
    //   return res.status(404).send("Error");
    // }

    // console.log(req.headers['content-type']);
    
    console.log("File has been uploaded. File id: "+file.metadata.shortname);
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

      // can utilise promise .then() .catch() instead of try and catch
      try{
        const filename = files[0].filename;
        // console.log(filename);
        const downloadStream = bucket.openDownloadStreamByName(filename);
        res.set('Content-Disposition', `attachment; filename="${filename}"`);
        res.set({'Access-Control-Expose-Headers': 'Content-Disposition'});     // https://stackoverflow.com/a/71195901
        await downloadStream.pipe(res);
        if(files[0].metadata.noOfDownload<=1){
          bucket.delete(files[0]._id);
        }else{
          // https://jira.mongodb.org/browse/CSHARP-2056
          db.collection('newBucket.files').updateOne({_id:files[0]._id},{$set: {"metadata.noOfDownload": files[0].metadata.noOfDownload-1 }});
        }
      }catch(err){
        res.send("Someone removed the file");
      }

    }

 });

app.get("/publicFiles", async (req,res) => {

  const cursor = bucket.find({});
  const files = await cursor.toArray();

  console.log("Delete request recieved");

  var publicFiles=[];
  for(var i=0;i<files.length;++i){
    console.log(files[i]);
    if(Date.parse(files[i].expTime)<=Date.now()){

      // can try locking mechanism also also for try and catch can utlise promise .then() .catch()
      try{
        await bucket.delete(files[i]._id);
      }catch{
        
      }
      
    }else if(files[i].metadata.isPublic){
      delete(files[i]._id);
      publicFiles.push(files[i]);
    }
  } 
  console.log("Number of public file send is: "+publicFiles.length);
  res.status(200).send(publicFiles);

})