const { mongoose } = require("mongoose");

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

module.exports = mongoose.model('fileDetails', fileDetailsSchema);
