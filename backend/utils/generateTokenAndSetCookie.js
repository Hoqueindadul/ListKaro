import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (match token expiry)
        path: "/", 
    };
    
    res.cookie("token", token, cookieOptions);

    const setCookieHeader = res.getHeaders()['set-cookie'];
    console.log("🍪 Set-Cookie header:", setCookieHeader);

    return token;
};