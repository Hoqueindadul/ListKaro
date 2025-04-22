import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone:{
        type: String,
        required: false,
        unique: true,
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
    isVarified: {
        type: Boolean,
        default: false, 
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpiresAt: {
        type: Date,
    },
    varificationToken: {
        type: String,
    },
    varificationTokenExpiresAt: {
        type: Date,
    },
}, {timestamps: true});

export const User = mongoose.model("User", userSchema);