const fileNo = require('../models/fileNo');

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

module.exports = hashName;