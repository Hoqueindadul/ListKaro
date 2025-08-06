import { User } from "../models/user.model.js";

export const checkEmailVerification = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.isVarified) {
            return res.status(403).json({
                success: false,
                message: "Email is not verified. Please verify your email before logging in."
            });
        }

        // Optional: Attach user to request for next middleware
        req.userFromDB = user;

        next();
    } catch (error) {
        console.error("Error in checkEmailVerification middleware:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
