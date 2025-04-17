import handleAsyncError from '../middleware/handleAsyncError.js';
import User from '../models/user.model.js';

// export const registerUser = handleAsyncError(async (req, res, next) => {
//     const {name, password, email} = req.body;
//     const user = await User.create({
//         name,
//         email,
//         password,
//         avatar: {
//             public_id: "This is temp id",
//             url: "This is temp url"
//         }

//     })

//     const token = user.getJWTToken();
//     res.status(200).json({
//         success: true,
//         message: "User registered successfully",
//         user: user,
//         token
//     })
// })

export const registerUser = handleAsyncError(async (req, res, next) => {
    const { name, password, email } = req.body;

    let avatar = {}; // Default to an empty object if no avatar is uploaded

    // Check if an avatar is uploaded
    if (req.files && req.files.avatar) {
        const result = await cloudinary.v2.uploader.upload(req.files.avatar.tempFilePath, {
            folder: "avatars", // Customize the folder
        });

        avatar = {
            public_id: result.public_id,
            url: result.secure_url,
        };
    }

    const user = await User.create({
        name,
        email,
        password,
        avatar, // This will be an empty object if no avatar is provided
    });

    const token = user.getJWTToken();
    res.status(200).json({
        success: true,
        message: "User registered successfully",
        user,
        token,
    });
});

