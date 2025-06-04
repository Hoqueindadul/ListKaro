import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId) => {
    // Generate a JWT token
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    })

    // Set the token in a cookie
    res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // true in production
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 24 * 60 * 60 * 1000, // 1 day or whatever you want
});

    return token;
}