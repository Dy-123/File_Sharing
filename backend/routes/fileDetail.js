var router = require('express').Router();
const fileDetails = require('../models/fileDetails');

router.get("/", async (req,res) => {
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

module.exports = router;