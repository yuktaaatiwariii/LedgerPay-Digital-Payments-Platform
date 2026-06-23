const moongoose = require('mongoose');
require('dotenv').config();



function connectDB() {
    moongoose.connect(process.env.MONGO_URI
   ).then(() => {
        console.log('Connected to MongoDB');
    }).catch((err) => {
        console.error('Error connecting to MongoDB', err);
        process.exit(1);
    });
}

module.exports = connectDB;