import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        trim: true,
        maxLenght: [30, "Name cannot exceed 30 characters"],
        minLength: [3, "Name should be at least 3 characters"],
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        validate: [validator.isEmail, "Please enter a valid email"],
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        select: false,
    },
    avatar: {
        public_id: {
            type: String,
            required: true
          },
          url: {
            type: String,
            required: true
          }
    },
    role: {
        type: String,
        default: "User"
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {timestamps: true})


// Encrypting password before saving
userSchema.pre("save", async function(next){
    this.password = await bcrypt.hash(this.password, 10);
    if(!this.isModified("password")) {
        return next();
    }
})

// JWT token
userSchema.methods.getJWTToken = function(){
    return jwt.sign({id: this._id}, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    })
}
export default mongoose.model("User", userSchema);