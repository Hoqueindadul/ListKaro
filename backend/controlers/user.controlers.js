import { User } from "../models/user.model.js";
import { PendingUser } from "../models/pendingUser.model.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
  sendVarificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendPasswordUpdatedEmail,
} from "../nodemailer/email.js";
// Signup Controller
export const signup = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Validate the request body
    if (!name || !email || !phone || !password) {
      throw new Error("Please fill all the fields");
    }

    // Check if the user already exists
    const userAlreadyExists = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (userAlreadyExists) {
      const isEmailExist = userAlreadyExists.email === email;

      return res.status(400).json({
        success: false,
        message: isEmailExist
          ? "User already exists with your entered email"
          : "User already exists with your entered phone number",
      });
    }

    // delete the pending user if exists with same email or phone number
    await PendingUser.deleteMany({ $or: [{ email }, { phone }] });

    // Hash the password
    const hashPassword = await bcryptjs.hash(password, 10);
    const varificationOTP = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const pendingUser = new PendingUser({
      name,
      email,
      phone,
      password: hashPassword,
      varificationOTP,
      varificationOTPExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      role: role || "user", // ← If role is provided (even "admin"), use it; else default to "user"
    });

    // Save to database
    await pendingUser.save();

    // Send verification otp to user email
    await sendVarificationEmail(email, varificationOTP);

    res.status(200).json({
      success: true,
      message:
        "Awesome! We just sent you a 6-digit code to verify your account.",
      email: email, // Passing it explicitly helps your frontend read it easily
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login Controller
export const login = async (req, res) => {
  // take the value of email and password from the request body

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    // and check if the user exists in the database
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // check if the user is deleted
    if (user.isDeleted) {
      return res.status(400).json({
        success: false,
        message:
          "Your account has been deleted. Please contact the administrator.",
      });
    }

    // check password is valid or not
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // generate token and set in cookie
    const token = generateTokenAndSetCookie(res, user._id);
    user.lastLogin = new Date();
    await user.save();

    // return success response
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user: {
        ...user._doc,
        password: undefined,
        isVerified: user.isVarified,
      },
    });
  } catch (error) {
    console.log("error in login", error);
  }
};

// Logout Controller
export const logout = async (req, res) => {
  try {
    // clear the cookie
    res.clearCookie("token");

    // send success response
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {}
};

// Email Varification Controller
export const varifyEmail = async (req, res) => {
  // take the value of verification code from the request body
  const { code } = req.body;
  try {
    const pendingUser = await PendingUser.findOne({
      varificationOTP: code,
      varificationOTPExpiresAt: { $gt: Date.now() },
    });

    // check code and user exist or not
    if (!pendingUser) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }
    // 3. Migrate the verified data into your permanent User collection
    const newUser = new User({
      name: pendingUser.name,
      email: pendingUser.email,
      phone: pendingUser.phone,
      password: pendingUser.password, // This is already hashed from the signup step
      isVarified: true,
      role: pendingUser.role,
    });

    // Save to the primary database collection
    await newUser.save();

    // delete the pending user
    await PendingUser.deleteOne({ _id: pendingUser._id });

    // Generate auth token and attach cookie if you want them logged in immediately
    const token = generateTokenAndSetCookie(res, newUser._id);

    // Trigger your welcome email in the background
    await sendWelcomeEmail(newUser.email, newUser.name);

    // send success response
    return res.status(200).json({
      seccess: true,
      message: "Email verified successfully",
      user: {
        ...newUser._doc,
        password: undefined,
        isVerified: newUser.isVarified,
      },
    });
  } catch (error) {
    console.log("error in varifyEmail", error);
    res.status(500).json({
      success: false,
      message: "server error",
      error: error.message,
    });
  }
};

// Forgot Password Controller
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    // send password email
    await sendPasswordResetEmail(
      user.email,
      `${process.env.DEPLOYMENT_CLIENT_URL}/reset-password/${resetToken}`,
    );

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email.",
    });
  } catch (error) {
    console.log("error in forgotPassword", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Reset Password Controller
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // update password
    const hashPassword = await bcryptjs.hash(password, 10);

    user.password = hashPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);

    res.status(200).json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.log("Error in resetPassword: ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Change Password Controller
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const isPasswordValid = await bcryptjs.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid old password",
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }
    const hashPassword = await bcryptjs.hash(newPassword, 10);
    user.password = hashPassword;
    await user.save();
    await sendPasswordUpdatedEmail(user.email);
    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.log("Error in changePassword: ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Check Auth Controller
// This controller is used to check if the user is authenticated or not
export const checkAuth = async (req, res) => {
  try {
    // Check if the user is authenticated or not
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      user: {
        ...user._doc,
        password: undefined,
        isVerified: user.isVarified,
      },
    });
  } catch (error) {
    console.log("Error in checkAuth: ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const userProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "-password -resetPasswordExpiresAt -resetPasswordToken -__v",
    );
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      user: {
        ...user._doc,
        password: undefined,
        isVerified: user.isVarified,
      },
    });
  } catch (error) {
    console.log("Error in userProfile: ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete user account
export const softDeleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    user.isDeleted = true;
    user.deletedAt = Date.now();
    await user.save();
    res.clearCookie("token");
    res.status(200).json({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error) {
    console.log("Error in softDeleteUser: ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};
