const mongoose = require('mongoose');

const connectToDatabase = async () => {
    try{
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
};

module.exports = connectToDatabase;