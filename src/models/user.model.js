const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({    
    email:{
        type:String,
        required:[,"Email is required"],
        trim:true,
        lowercase:true,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"Please fill a valid email address"],
        unique:[true,"Email already exists"]
    },

    name:{
        type:String,
        required:[,"Name is required"],
    },
    password:{
        type:String,
        required:[,"Password is required"], 
        minlength:[6,"Password must be at least 6 characters long"],
        select:false
    },
    systemUser:{
        type:Boolean,
        default:false,
        immutable:true,
        select:false
    }
},{
    timestamps:true
});

userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return ;}
     const hash = await bcrypt.hash(this.password,10);
        this.password = hash;
});

  userSchema.methods.comparePassword = async function(password){
        return await bcrypt.compare(password,this.password);
    }
  
  const userModel = mongoose.model('User',userSchema);

module.exports = userModel 