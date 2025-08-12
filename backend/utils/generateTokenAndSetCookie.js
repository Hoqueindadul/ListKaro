import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId) => {
    // Generate a JWT token
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });

    // Production vs Development cookie settings
    const isProduction = process.env.NODE_ENV === "production";
    
    const cookieOptions = {
        httpOnly: true,
        secure: isProduction, // Only secure in production (HTTPS required)
        sameSite: isProduction ? "none" : "lax", // "none" for cross-origin in production
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/", // Available on all paths
    };

    // Debug logging
    console.log("🍪 Environment:", process.env.NODE_ENV);
    console.log("🍪 Setting cookie with options:", cookieOptions);
    
    res.cookie("token", token, cookieOptions);

    // Verify the cookie was set in headers
    const setCookieHeader = res.getHeaders()['set-cookie'];
    console.log("🍪 Set-Cookie header:", setCookieHeader);

    return token;
};