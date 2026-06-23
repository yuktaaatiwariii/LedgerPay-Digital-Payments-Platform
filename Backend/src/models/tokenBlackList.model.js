const mongoose = require("mongoose");

const tokenBlacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [ true, "Token is required"],
        unique: [   true, "Token already exists"]
    }
     },{
       timestamps: true 
    }
);

tokenBlacklistSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60*60*24*3}); // 3 days in seconds


const tokenBlacklistModel = mongoose.model("TokenBlacklist", tokenBlacklistSchema);
module.exports = tokenBlacklistModel;