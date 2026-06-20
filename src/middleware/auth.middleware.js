const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const tokenBlacklistModel = require('../models/tokenBlackList.model');

async function authMiddleware(req,res,next){

    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];

    if(!token){
        return res.status(401).json({message:"Unauthorized access, token missing"});
    }

    const isBlacklisted = await tokenBlacklistModel.findOne({token});
    if(isBlacklisted){
    return res.status(401).json({message:"Unauthorized access, token is blacklisted"});
     }

    try{

        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.userId) 
        .select("+role");
        req.user = user;
        next();

    }catch(err){
        return res.status(401).json({
            message:"Unauthorized access, invalid token"
        });
    }
}

async function authSystemMiddleware(req,res,next){

    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];
    if(!token){
        return res.status(401).json({
            message:"Unauthorized access, token missing"});
    }

    const isBlacklisted = await tokenBlacklistModel.findOne({token});
    if(isBlacklisted){
    return res.status(401).json({message:"Unauthorized access, token is blacklisted"});
     }

    try{

        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.userId).select("+role")
        if(!user || user.role !== "ADMIN"){
            return res.status(403).json({
                message:"Forbidden access, Only admins can access this route "
            });
        }

        req.user = user;
        next();

    }catch(err){
        return res.status(401).json({
            message:"Unauthorized access, invalid token"
        });
    }
}


module.exports = { authMiddleware, authSystemMiddleware };