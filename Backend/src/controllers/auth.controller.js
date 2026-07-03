const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const emailService = require('../services/email.service');
const tokenBlacklistModel = require('../models/tokenBlackList.model');



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

    const token = jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:'3d'});
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

    const token = jwt.sign({userId:user._id,
         role: user.role,
    },process.env.JWT_SECRET,{expiresIn:'3d'});
    res.cookie('token',token,{
        httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 3 * 24 * 60 * 60 * 1000,

    }).status(200).json({
        message:"User logged in successfully",
        status:{statusCode:200 , statusText:"success"},
        token:token,
         user: {
              _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    customerId: user.customerId,
    lastLogin: user.lastLogin,
    previousLogin: user.previousLogin,
         }
    });

console.log(user.role);
}

// user logout - POST - /api/auth/logout

async function userLogoutController(req,res){   

  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if(!token){
    return res.status(200).json({
        message:"User logged out successfully",
    });
  }
     res.cookie("token","");

    await tokenBlacklistModel.create({token:token});

    res.status(200).json({
        message:"User logged out successfully",
    });
}   

module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController
}
