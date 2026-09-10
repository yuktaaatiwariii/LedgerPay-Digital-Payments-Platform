const userModel = require('../models/user.model');
const emailService = require('../services/email.service');
const RefreshToken = require("../models/refreshToken.model");
const {generateAccessToken,generateRefreshToken} = require("../services/token.service");
const jwt = require("jsonwebtoken");

const hashToken = require("../utils/hashToken");


// user register - POST - /api/auth/register

async function  userRegisterController(req,res){

    const {name,email,password } = req.body; 

    const isExists = await userModel.findOne({email:email});
    if(isExists){
        return res.status(400).json({
            message:"User already exists",
            status:"failed"
        })
    }

const customerId =
  "CUST" +
  Date.now().toString().slice(-6) +
  Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase();

    const user= await userModel.create({
        name:name,
        email:email,
        password:password,
         customerId: customerId
    })

    const token = jwt.sign({userId:user._id},process.env.JWT_ACCESS_SECRET,{expiresIn:'30m'});
    res.cookie('token',token).status(201).json({
        user:{
            _id:user._id,
            email:user.email,
            name:user.name,
            customerId: user.customerId,
        
        },
        message:"User registered successfully",
        status:"success",
        token:token
    });
    await emailService.sendRegistrationEmail(user.email, user.name);
}

// user login - POST - /api/auth/login

async function userLoginController(req,res){
    const {email,password} = req.body;

    const user = await userModel.findOne({email:email}).select('+password +role');
    if(!user){
        return res.status(400).json({
            message:"Invalid credentials",
            status:"failed"
        })
    }

    const isValidPassword = await user.comparePassword(password);

     if(!isValidPassword){
        return res.status(400).json({
            message:"Invalid credentials",
            status:"failed"
        })
    }

  console.log("Logging in user:", user._id);


    user.previousLogin = user.lastLogin;

user.lastLogin = new Date();

await user.save();

  
// Generate Tokens
const accessToken = generateAccessToken(user);
const refreshToken = generateRefreshToken(user);

// Hash Refresh Token
const hashedRefreshToken = hashToken(refreshToken);

// Save Refresh Token in MongoDB
await RefreshToken.create({
    user: user._id,
    tokenHash: hashedRefreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
});

// Send Refresh Token in HttpOnly Cookie
res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
});

// Return Access Token
return res.status(200).json({
    message: "User logged in successfully",
    status: {
        statusCode: 200,
        statusText: "success",
    },
    accessToken,
    user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        customerId: user.customerId,
        lastLogin: user.lastLogin,
        previousLogin: user.previousLogin,
    },
});



}

// Refresh Access Token - POST - /api/auth/refresh-token


async function refreshAccessTokenController(req, res) {
    try {

        // Get Refresh Token from Cookie
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh token missing",
            });
        }

        // Verify JWT
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        // Hash Incoming Token
        const hashedToken = hashToken(refreshToken);

        // Find Token in DB
        const storedToken = await RefreshToken.findOne({
            tokenHash: hashedToken,
            revoked: false, expiresAt: { $gt: new Date() },
        });

        if (!storedToken) {
            return res.status(401).json({
                message: "Invalid Refresh Token",
            });
        }

        // Load User
        const user = await userModel.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Generate New Tokens
        const newAccessToken = generateAccessToken(user);

        const newRefreshToken = generateRefreshToken(user);

        // Rotate Refresh Token
        storedToken.tokenHash = hashToken(newRefreshToken);

        storedToken.expiresAt = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        );

        await storedToken.save();

        // Replace Cookie
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            accessToken: newAccessToken,
        });

    } catch (err) {

        return res.status(401).json({
            message: "Invalid Refresh Token",
        });

    }
}


// user logout - POST - /api/auth/logout

async function userLogoutController(req, res) {
    try {

        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(200).json({
                message: "User logged out successfully",
            });
        }

        // Hash the refresh token
        const hashedToken = hashToken(refreshToken);

        // Revoke it
        await RefreshToken.findOneAndUpdate(
            {
                tokenHash: hashedToken,
            },
            {
                revoked: true,
            }
        );

        // Clear Cookie
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });

        return res.status(200).json({
            message: "User logged out successfully",
        });

    } catch (err) {

        return res.status(500).json({
            message: "Logout failed",
        });

    }
}

module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController,
    refreshAccessTokenController
}
