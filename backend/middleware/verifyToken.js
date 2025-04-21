import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    // take token from cookies
    const token = req.cookies.token;

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