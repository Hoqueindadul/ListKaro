import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    // take token from cookies
    const token = req.cookies.token;

    res.cookie("token", token, {
        httpOnly: true,
        secure: false, // ✅ Change to true in production if using HTTPS
        sameSite: "Lax", // ✅ Change to "None" if using secure:true and cross-origin
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    // check if token is present
    if(!token){
        return res.status(401).json({
            success: false,
            message: "Unauthorized - no token provided"
        })
    }
    try {
        // verify token
        // using JWT secret from environment variables
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({
                success: false,
                message: "Unauthorized - invalid token"
            })
        }
        // Attach user ID to request object
        req.userId = decoded.userId;
        next();

    } catch (error) {
        console.log("Error in verifying token", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        })
    }
}