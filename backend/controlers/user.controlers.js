import handleAsyncError from '../middleware/handleAsyncError.js';
import User from '../models/user.model.js';

export const registerUser = handleAsyncError(async (req, res, next) => {
    const {name, password, email} = req.body;
    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: "This is temp id",
            url: "This is temp url"
        }

    })

    const token = user.getJWTToken();
    res.status(200).json({
        success: true,
        message: "User registered successfully",
        user: user,
        token
    })
})