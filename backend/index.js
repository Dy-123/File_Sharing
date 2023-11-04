const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { S3Client, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3')
require("dotenv").config();

let s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  region: 'ap-south-1',
});


const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL , credentials: true }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));    // Parse URL-encoded bodies (form data)

const server = app.listen(5000, function(){
    console.log('node server is running ...');
});

try {
    mongoose.connect(process.env.MONGO_CONN_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    }).then(()=>{
      console.log("MongoDB connected")
    }).catch((err)=>{
      console.log("MongoDB connection error: "+err);
    });
  } catch (error) {
    console.log("error in connection"+error)
  }

const fileDetailsSchema = new mongoose.Schema({
  filename: {type:String},
  size: {type:Number},
  shortname: { type: String },
  expiryTime: { type: Date },
  noOfDownload: { type: Number },
  isPublic: { type: Boolean },
  password: { type: String },
  uploadedBy: { type: String},
  // awsS3Link: {type: String},
  awsBucket: {type: String},
  awsBuckeyFileKey: {type: String},
});
const fileDetails = mongoose.model('fileDetails', fileDetailsSchema);

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
      string= string.concat(String.fromCharCode(97 + count%26));           
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
    return generateShortName(doc.count);
}

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'file-sharing-files',
    // // can use aws s3 lifecycle leverage to automatically 
    // // delete file on time expiry: haven't setup in this, 
    // // in this manually delete when needed
    // metadata: function (req, file, cb) {
    //   // console.log(req.body.expiryTime);
    //   cb(null,{expiry: req.body.expiryTime});
    // }
  }),
}).single("fileUpload");

app.post('/upload',(req,res)=>{
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

// using multer to parse the form data
const upDown = multer();
app.post('/download',upDown.none(), async (req, res) => {
    console.log("File downloaded started");
    try{
      const file =  await fileDetails.find({ 'shortname' : req.body.filename });

      if (file.length===0) {
        console.log('No files found');
        res.status(404).send("File not found");
      } else {

        if(file[0].password!='' && file[0].password!=req.body.password){
          res.status(401).send("File is password protected.");
        }else{

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
      console.log("error while downloading: ", err);
      res.status(500).send(err.message);
    }

 });

app.get("/fileDetail", async (req,res) => {
  const fileID = req.query.ID;
  const passwordValue = req.query.pass;
  try{
    const file =  await fileDetails.find({ 'shortname' : fileID });
    if (file.length===0) {
      // console.log('No files found');
      res.status(404).send("File not found");
    } else {
      if(file[0].password!='' && file[0].password!=passwordValue){
        res.status(401).send("File is password protected.");
      }else{
        // delete not working need to be modified in whole code
        delete file[0]._id;
        delete file[0].awsBucket;
        delete file[0].awsBuckeyFileKey;
        res.status(200).send(file[0]);
      }
    }
  }catch(err){
    res.status(500).send(err.message);
  }
});

app.get("/publicFiles", async (req,res) => {

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

})

// Define the schema for storing otp
const otpSchema = new mongoose.Schema({
  email : { type: String },
  otp: { type: Number },
  time: {type: Date, expires: 600, default: Date.now}
}); 

const otp = mongoose.model("otp",otpSchema);

app.get("/otp",async(req,res)=>{

  const mailTransport = nodemailer.createTransport({
    service: 'gmail',
      auth: {
      user: process.env.MAIL_ID,
      pass: process.env.MAIL_PASS
      }
   })  


  const otpNumber = Math.floor(100000 + Math.random() * 900000);


  let mailDetails = {
    from: '"File Sharing"<dy55069790@gmail.com>',
    // to: '3219102rn@gmail.com',
    to: `${req.query.mail}`,
    subject: 'OTP for account password',
    // Math.floor(100000 + Math.random() * 900000) is not secure replace it with number generated by crypto
    text: `Your OTP for File sharing app is ${otpNumber}. It will be valid for 10min.`
  };
  
  mailTransport.sendMail(mailDetails, async (err, data) => {
    if(err) {
      console.log('Error occured in sending email:',err.message);
      res.status(500).send(err.message);
    } else {
      console.log("Email send successfull to",req.query.mail);
      try{
        await otp.findOneAndUpdate({email: req.query.mail},{email: req.query.mail, otp: otpNumber},{upsert: true});
        console.log("Otp created successfully");
        res.status(200).send("Otp created successfully");
      }catch(err){
        console.log("Error occured in otp creation",err);
        res.status(500).send("Error Occured in otp creation");
      }
    }
  });

});

const userSchema = new mongoose.Schema({
  email: {type: String, require: true, unique: true},
  password: {type: String, require: true}
});

const users = mongoose.model('users',userSchema);

app.post("/login",multer().none(), async (req,res) => {
  const {mail, password} = req.body;

  try{
    const user = await users.findOne({email: mail});
    if(user===null){
      res.status(404).send("User not found");
    }else if(password!==user.password){
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

app.post("/resetSignup",multer().none(), async (req,res) => {
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

app.get("/myFiles", async(req,res) => {

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

app.get("/logout",async (req,res)=>{

  console.log("Log out requet received");

  // From express documentation of res.clearCookie: Web browsers and other compliant clients will only clear 
  // the cookie if the given options is identical to those given to res.cookie(), excluding expires and maxAge.
  if(req.cookies!==undefined && req.cookies.pass!==undefined){

    const cookieOptions = {
      httpOnly: true,
      expires: new Date(0)
    }
    res.clearCookie('pass',cookieOptions);
    res.clearCookie('mail',{expires: new Date(0)});

  }else{
    if(req.cookies!==undefined){
      res.clearCookie('mail',{expires: new Date(0)});
    }
  }
  res.send("Logout successfull");

});

app.get("/deleteFile", async (req,res) => {
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