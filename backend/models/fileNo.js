const mongoose = require("mongoose");

// Define the schema to count number of file that has been served
const countSchema = new mongoose.Schema({
    identifier : { type: String, unique: true, default: 'countFileServed' },
    count: { type: Number, default: 0 }
});

// Imported in ../utils/hashName.js
module.exports = mongoose.model('fileNo', countSchema);