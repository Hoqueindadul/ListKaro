import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, required: false, match: /^[0-9]{10}$/ },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  otp: {
    code: { type: String },
    expiresAt: { type: Date },
    verified: { type: Boolean, default: false }
  }
}, { timestamps: true });

const User = mongoose.model("Customers", userSchema);

export default User;
