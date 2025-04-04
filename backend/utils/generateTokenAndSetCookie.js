import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId) => {
    // Generate a JWT token
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    })

    // Set the token in a cookie
    res.cookie("token", token, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production", // Set to true in production
        sameSite: "strict", // CSRF protection
        maxAge: 7 * 24 * 60 *60 * 1000,
    })
    return token;
}