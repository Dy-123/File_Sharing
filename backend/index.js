const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require("dotenv").config();

const connectToDatabase = require('./configs/mongodb');
connectToDatabase();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL , credentials: true }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));    // Parse URL-encoded bodies (form data)

app.listen(process.env.PORT_NO, function(){
    console.log('node server is running ...');
});

const routes = [
    { path: '/upload', route: require('./routes/upload') },
    { path: '/download', route: require('./routes/download') },
    { path: '/fileDetail', route: require('./routes/fileDetail') },
    { path: '/publicFiles', route: require('./routes/publicFiles') },
    { path: '/otp', route: require('./routes/otpRequest') },
    { path: '/login', route: require('./routes/login') },
    { path: '/resetSignup', route: require('./routes/resetSignup') },
    { path: '/myFiles', route: require('./routes/myFiles') },
    { path: '/logout', route: require('./routes/logout') },
    { path: '/deleteFile', route: require('./routes/deleteFile') },
];

routes.forEach(({ path, route }) => {
    app.use(path, route);
});