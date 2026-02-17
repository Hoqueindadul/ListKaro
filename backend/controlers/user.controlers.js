import { User } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto"
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import sendSMS from "../nodemailer/sendSMSToPhone.js";
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
            $or: [
                { email },
                { phone }
            ]
        });

        if (userAlreadyExists) {
            const isEmailExist = userAlreadyExists.email === email;

            return res.status(400).json({
                success: false,
                message: isEmailExist ?
                    "User already exists with your entered email" :
                    "User already exists with your entered phone number",
            });
        }

        // Hash the password
        const hashPassword = await bcryptjs.hash(password, 10);
        const varificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        const user = new User({
            name,
            email,
            phone,
            password: hashPassword,
            varificationToken,
            varificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
            role: role || "user"  // ← If role is provided (even "admin"), use it; else default to "user"
        });

        // Save to database
        await user.save();

        // Set cookie
        const token = generateTokenAndSetCookie(res, user._id);
        console.log("signup token", token);

        // Send verification email
        const smsBody = `Your ListKaro verification code is: ${varificationToken}. Valid for 10 minutes.`;
        const phoneNumber = `+91${phone}`;
        await sendSMS(phoneNumber, smsBody);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                ...user._doc,
                password: undefined,
            },
        });
    } catch (error) {
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
                message: "Invalid credentials"
            })
        }

        // check password is valid or not
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            })
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
                isVerified: user.isVarified
            }
        })
    } catch (error) {
        console.log("error in login", error)
    }
}

// Logout Controller
export const logout = async (req, res) => {
    try {
        // clear the cookie
        res.clearCookie("token");

        // send success response
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        })
    } catch (error) {

    }
}

// Email Varification Controller
export const varifyEmail = async (req, res) => {
    // take the value of verification code from the request body
    const { code } = req.body;
    try {
        const user = await User.findOne({
            varificationToken: code,
            varificationTokenExpiresAt: { $gt: Date.now() }
        })

        // check code and user exist or not
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification code"
            })
        }
        user.isVarified = true;
        user.varificationToken = undefined;;
        user.varificationTokenExpiresAt = undefined;
        await user.save();

        // send success response
        res.status(200).json({
            seccess: true,
            message: "Email verified successfully",
            user: {
                ...user._doc,
                password: undefined,
            }
        })
    } catch (error) {
        console.log("error in varifyEmail", error);
        res.status(500).json({
            success: false,
            message: "server error",
            error: error.message,
        })
    }
}

// Forgot Password Controller
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }

        // generate reset token
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000 // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;

        await user.save();

        // send password email
        await sendPasswordResetEmail(user.email, `${process.env.DEPLOYMENT_CLIENT_URL}/reset-password/${resetToken}`)

        res.status(200).json({
            success: true,
            message: "Password reset link sent to your email."
        })
    } catch (error) {
        console.log("error in forgotPassword", error)
        res.status(400).json({ success: false, message: error.message })
    }
}

// Reset Password Controller
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() }
        })

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token"
            })
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
            message: "Password reset successfully."
        })
    } catch (error) {
        console.log("Error in resetPassword: ", error)
        res.status(400).json({ success: false, message: error.message })
    }
}

// Check Auth Controller
// This controller is used to check if the user is authenticated or not
export const checkAuth = async (req, res) => {
    try {
        // Check if the user is authenticated or not
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            })
        }
        res.status(200).json({
            user: {
                ...user._doc,
                password: undefined,
                isVerified: user.isVarified
            }
        })
    } catch (error) {
        console.log("Error in checkAuth: ", error)
        res.status(400).json({ success: false, message: error.message })
    }
}