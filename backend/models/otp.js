const mongoose = require("mongoose");

// Define the schema for storing otp
const otpSchema = new mongoose.Schema({
    email : { type: String },
    otp: { type: Number },
    time: {type: Date, expires: 600, default: Date.now}
}); 

module.exports = mongoose.model("otp",otpSchema);