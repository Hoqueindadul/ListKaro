## <p align="center">Backend</p>
### App.js
```
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";

import connectDB from "./connection/dbConnection.js";
import searchProductRoute from "./routers/searchProduct.route.js";
import productsRoute from "./routers/products.route.js";
import ocrRoute from "./routers/ocr_route.js";
import userRoute from "./routers/user.route.js";
import newsletterRoute from "./routers/newsletter_route.js";
import paymentRoute from "./routers/payment_route.js";
import cartRoute from "./routers/cart.route.js";
import orderRoute from "./routers/order_route.js";
import orderEmail from "./nodemailer/orderEmail.js";
import errorHandleMiddleware from "./middleware/error.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const __dirname = path.resolve();

// Allowed origins for CORS
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.DEPLOYMENT_CLIENT_URL,
];

// Log incoming request origins
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`Incoming request from origin: ${origin}`);
  next();
});

// CORS config
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Connect to MongoDB
connectDB(MONGO_URI);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api", ocrRoute);
app.use("/api/cart", cartRoute);
app.use("/api/search", searchProductRoute);
app.use("/api/products", productsRoute);
app.use("/api/auth", userRoute);
app.use("/api", newsletterRoute);
app.use("/api", paymentRoute);
app.use("/api/order", orderRoute);
app.use("/api", orderEmail);

// Error handler middleware (should be after routes)
app.use(errorHandleMiddleware);

// Default route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

```

## Connection
### dbConnection.js
```
import mongoose from "mongoose";

const connectDB = (uri) => {
    mongoose.connect(uri)
        .then(() => console.log("List Karo is Connected to database"))
        .catch((error) => {
            console.error("MongoDB Connection Error:", error);
            process.exit(1);
        });
};

export default connectDB;
```  
## Controllers
### user.controller.js
```
import { User } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto"
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVarificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail } from "../nodemailer/email.js";

// Signup Controller
export const signup = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        // Validate the request body
        if (!name || !email || !phone || !password) {
            throw new Error("Please fill all the fields");
        }

        // Check if the user already exists
        const userAlreadyExists = await User.findOne({ email })
        if (userAlreadyExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            })
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
            varificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        })

        // save into database
        await user.save();

        // generate jwt token and set in cookie
        generateTokenAndSetCookie(res, user._id);

        // Send the verification email
        await sendVarificationEmail(user.email, varificationToken);
        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                ...user._doc,
                password: undefined,
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

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

        // send welcome email
        await sendWelcomeEmail(user.email, user.name);

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
        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`)

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
```
### product.controller.js
```
import Product from '../models/products.model.js';
import APIFunctionality from '../utils/apiFunctionality.js';
import HandleError from '../utils/handleError.js';
import handleAsyncError from '../middleware/handleAsyncError.js';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup
const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const createProduct = handleAsyncError(async (req, res) => {
  try {


    // Validate image upload
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    // Validate required fields
    const {
      name,
      description,
      price,
      category,
      stock,
      quantityValue,
      quantityUnit
    } = req.body;

    if (
      !name?.trim() ||
      !description?.trim() ||
      !price ||
      !category?.trim() ||
      !stock ||
      !quantityValue ||
      !quantityUnit?.trim()
    ) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    // Upload images to Cloudinary
    const imageFiles = await Promise.all(
      req.files.map((file) => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: 'image' },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                reject(error);
              } else {
                resolve({ public_id: result.public_id, url: result.secure_url });
              }
            }
          ).end(file.buffer);
        });
      })
    );

    // Create product object
    const productData = {
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      image: imageFiles,
      quantity: {
        value: Number(quantityValue),
        unit: quantityUnit
      },
      user: req.user._id
    };

    const product = await Product.create(productData);

    res.status(201).json({ success: true, product });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
});


// SEARCH PRODUCTS BY KEYWORDS
export const searchProductsByKeyword = handleAsyncError(async (req, res, next) => {

  const apiFeatures = new APIFunctionality(Products.find(), req.query).search().filter();

  const allProducts = await apiFeatures.query;

  if (!allProducts || allProducts.length === 0) {
    return next(new HandleError("No products found", 404));
  }

  res.status(200).json({
    success: true,
    totalProduct: allProducts.length,
    message: "Products fetched successfully",
    data: allProducts
  });
});

// GET ALL PRODUCT
export const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    if (!products) {
      return next(new HandleError("Products not found", 404));
    }
    res.status(200).json({
      success: true,
      message: "Products found successfully.",
      data: products
    })
  } catch (error) {
    console.log(error)
  }
}

// UPDATE PRODUCT
export const updateProduct = async (req, res, next) => {
  try {
    const updatedFields = req.body;

    // Optional: Prevent updating certain fields
    // delete updatedFields.createdAt;

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updatedFields, {
      new: true, // return the updated document
      runValidators: true, // run schema validations
    });

    if (!updateProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct
    });

  } catch (error) {
    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0].message;
      return res.status(400).json({
        success: false,
        message: firstError
      });
    }

    console.error("Update product error:", error);
    next(error);
  }
};

// DELETE PRODUCT
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return next(new HandleError("Product not found", 404));
    }
    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: product
    });
  } catch (error) {
    next(error);
  }
}

// GET SINGLE PRODUCT
export const getSingleProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new HandleError("Product not found", 404));
    }
    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product
    });
  } catch (error) {
    next(error);
  }
}
```

### ocr.controller.js
```
import fs from 'fs';
import axios from 'axios';
import Products from '../models/products.model.js';
import Cart from '../models/cart.model.js';

const AZURE_KEY = process.env.AZURE_KEY;
const AZURE_ENDPOINT = process.env.AZURE_ENDPOINT;
const AZURE_OCR_URL = AZURE_ENDPOINT + 'vision/v3.2/read/analyze';
export const extractProductDataFromImage = async (req, res) => {
    try {
        const imagePath = req.file.path;
        const imageData = fs.readFileSync(imagePath);

        const headers = {
            'Ocp-Apim-Subscription-Key': AZURE_KEY,
            'Content-Type': 'application/octet-stream',
        };

        const response = await axios.post(AZURE_OCR_URL, imageData, { headers });
        const operationLocation = response.headers['operation-location'];

        let result;
        let attempts = 0;
        while (attempts < 10) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const resultRes = await axios.get(operationLocation, {
                headers: { 'Ocp-Apim-Subscription-Key': AZURE_KEY },
            });

            if (resultRes.data.status === 'succeeded') {
                result = resultRes.data.analyzeResult.readResults;
                break;
            } else if (resultRes.data.status === 'failed') {
                return res.status(400).json({ error: 'OCR failed.' });
            }

            attempts++;
        }

        fs.unlinkSync(imagePath);

        // Process the OCR result and split by key-value
        const keyValuePairs = {};
        const allLines = result.flatMap(page => page.lines.map(line => line.text));

        // Update regex to handle "=" along with "-", ":", and spaces
        for (const line of allLines) {
            const regex = /([a-zA-Z\s]+)[\s\-:=]+(\d+(\.\d+)?\s*(kg|g|lb|oz)?)/i;
            const match = line.match(regex);

            if (match) {
                const productName = match[1].trim();
                const quantityText = match[2].trim();
                keyValuePairs[productName] = quantityText;
            }
        }

        const results = {};

        for (const [productName, quantityText] of Object.entries(keyValuePairs)) {
            const product = await Products.findOne({ name: new RegExp(`^${productName}$`, 'i') });

            if (product) {
                const qtyMatch = quantityText.match(/\d+/);
                const numericQty = qtyMatch ? parseInt(qtyMatch[0]) : 1;

                // Check if the user is logged in (userId should be available if token is verified)
                if (!req.userId) {
                    return res.status(401).json({ success: false, message: "User is not authenticated" });
                }

                // Find the user's cart, create one if it doesn't exist
                let cart = await Cart.findOne({ userId: req.userId });

                // If cart doesn't exist, create it
                if (!cart) {
                    cart = new Cart({
                        userId: req.userId,
                        products: [],
                    });
                }

                // Check if the product already exists in the cart
                const existingProductIndex = cart.products.findIndex(
                    item => item.productId.toString() === product._id.toString()
                );

                if (existingProductIndex !== -1) {
                    // If the product exists, update its quantity
                    cart.products[existingProductIndex].quantity += numericQty;
                } else {
                    // If the product doesn't exist, add it to the cart
                    cart.products.push({
                        productId: product._id,
                        quantity: numericQty,
                        source: 'ocr', // Indicate that this item was added via OCR
                    });
                }

                // Save the updated cart
                await cart.save();

                results[productName] = {
                    found: true,
                    cartAdded: true,
                    product: {
                        _id: product._id,
                        name: product.name,
                        price: product.price,
                        category: product.category,
                        image: product.image,
                        stock: product.stock,
                        quantityDetected: quantityText,
                    },
                };
            } else {
                results[productName] = {
                    found: false,
                    cartAdded: false,
                    quantityDetected: quantityText,
                    message: `'${productName}' not found in the database.`,
                };
            }
        }

        let totalProductsAdded = Object.values(results).filter(item => item.cartAdded).length;

        return res.status(200).json({
            success: true,
            message: 'Products added to cart successfully.',
            totalProductsAdded,
            lines: allLines,
            data: results,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong during OCR.' });
    }
};
```
### cart.controller.js
```
import Cart from "../models/cart.model.js";

export const getUserCart = async (req, res) => {
  try {
    // Ensure the user is authenticated
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - user not logged in",
      });
    }

    // Find the user's cart and populate product details (productId is the reference in cart)
    const cart = await Cart.findOne({ userId: req.userId }).populate("products.productId");

    if (!cart || !cart.products || cart.products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart is empty",
        data: [],
      });
    }

    // Safely filter only products where productId is valid and populated
    const filteredProducts = cart.products.filter(item => item.productId && item.productId._id);

    // If no valid products after filtering
    if (filteredProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No valid products found in cart",
        data: [],
      });
    }

    // Format the filtered products
    const formattedProducts = filteredProducts.map((item) => ({
      _id: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      image: item.productId.image,
      category: item.productId.category,
      stock: item.productId.stock,
      quantity: item.quantity,
      description: item.productId.description || "",
      source: item.source || "manual", // OCR/manual
    }));

    // Send the response
    return res.status(200).json({
      success: true,
      message: "Cart items fetched successfully",
      userId: cart.userId,
      data: formattedProducts,
    });

  } catch (error) {
    console.error("Error fetching cart:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const removeItemFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - You are not logged in",
      });
    }

    // Pull the product from the cart array
    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      {
        $pull: {
          products: { productId: productId }, // remove matching product from array
        },
      },
      { new: true }
    ).populate("products.productId");

    if (!updatedCart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found or product not found in cart",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product removed from cart successfully",
      data: updatedCart.products,
    });

  } catch (error) {
    console.error("Error removing item from cart:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
```
### bulkUpload.controller.js
```
import Product from "../models/products.model.js";
import Cart from "../models/cart.model.js";

export const bulkUploadProducts = async (req, res) => {
    try {
        const userId = req.userId;
        const { products } = req.body; // array of { name, quantity, source (optional) }

        if (!products || !Array.isArray(products)) {
            return res.status(400).json({ success: false, message: "Invalid products format" });
        }

        const matchedProducts = [];
        const addedItems = [];

        for (const item of products) {
            const product = await Product.findOne({ name: new RegExp("^" + item.name + "$", "i") });
            if (product) {
                const quantity = parseQuantity(item.quantity);
                const source = item.source || "manual";

                matchedProducts.push({
                    productId: product._id,
                    quantity,
                    source,
                });

                addedItems.push({
                    name: product.name,
                    quantity,
                    source,
                });
            }
        }

        // Step 2: Update or create cart
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, products: matchedProducts });
        } else {
            cart.products = matchedProducts;
        }

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Bulk upload successful. Cart updated.",
            addedItems,
        });

    } catch (err) {
        console.error("Bulk Upload Error:", err);
        return res.status(500).json({ success: false, message: "Bulk upload failed" });
    }
};

function parseQuantity(qty) {
    const num = parseInt(qty);
    return isNaN(num) || num < 1 ? 1 : num;
}
```

## Routers
### user.route.js
```
import express from 'express';
const router = express.Router();
import { verifyToken } from '../middleware/verifyToken.js';
import { signup, login, logout, varifyEmail, forgotPassword, resetPassword, checkAuth } from '../controlers/user.controlers.js';

router.get("/check-auth", verifyToken, checkAuth);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/verify-email", varifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
```

### products.route.js
```
import express from 'express';
import { upload, createProduct, searchProductsByKeyword, getAllProducts, updateProduct, deleteProduct, getSingleProduct } from '../controlers/products.controler.js';
import { verifyToken, roleBasedAccess } from '../middleware/verifyToken.js';

const router = express.Router();

// Route to create a new product
router.post('/createProduct', verifyToken, roleBasedAccess('admin'),  upload.array('images'),  createProduct);
  

// Route to get products by keyword
router.get('/searchProductsByKeyword', searchProductsByKeyword);

// Route to get all products
router.get('/getAllProducts', verifyToken, getAllProducts);

// Route to get a single product by ID
router.get('/singleProduct/:id', verifyToken, getSingleProduct);

// Route to update a product by ID
router.put('/updateProduct/:id', verifyToken, upload.array('images'), updateProduct);


// Route to delete a product by ID
router.delete('/deleteProduct/:id', verifyToken, deleteProduct);

export default router;
```
### ocr.route.js
```
import express from 'express';
import multer from 'multer';
import { extractProductDataFromImage } from '../controlers/ocr.controler.js';
import { bulkUploadProducts } from '../controlers/bulkUpload.controler.js';
import { verifyToken } from '../middleware/verifyToken.js'

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/upload-ocr', verifyToken, upload.single('image'), extractProductDataFromImage);
router.post('/bulk-upload', verifyToken, bulkUploadProducts);

export default router;
```
### cart.route.js
```
import express from "express";
import { getUserCart, removeItemFromCart } from "../controlers/cart.controler.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Get cart items for the logged-in user
router.get("/user-cart", verifyToken, getUserCart);
router.delete("/user-cart/:productId", verifyToken, removeItemFromCart);

export default router;
```
### newsletter.route.js
```
import express from 'express';
import Newsletter from '../models/newsletter_model.js';

const newsletterRoute = express.Router();

newsletterRoute.post('/subscribe', async (req, res) => {
    const { email } = req.body;
    
    if (!email) return res.status(400).json({ message: 'Please enter a valid email' });

    try {

        const existingUser = await Newsletter.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'You are already subscribed to ListKaro.' });
        }

        const newSub = new Newsletter({ email });
        await newSub.save();

        res.status(201).json({ message: 'Congratulations! You subscribed to ListKaro' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong! Please try again later' });
    }
});

export default newsletterRoute;
```
### order.route.js
```
import express from "express";
import Order from "../models/order_model.js";

const order_Route = express.Router();

order_Route.post("/", async (req, res) => {
  try {
    const { customerDetails, cartItems, totalAmount, paymentMode } = req.body;  // paymentMode
    if (!customerDetails || !cartItems || !totalAmount || !paymentMode) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newOrder = new Order({ customerDetails, cartItems, totalAmount, paymentMode });  // paymentMode
    const savedOrder = await newOrder.save();

    res.status(201).json({ message: "Order placed", order: savedOrder });
  } catch (error) {
    console.error("Order save error:", error);
    res.status(500).json({ message: "Failed to place order" });
  }
});


export default order_Route;
```
### payment.route.js
```
import express from 'express'
import Razorpay from "razorpay";
import dotenv from 'dotenv'
dotenv.config();

const paymentRoute = express.Router();

const instance = new Razorpay({
    key_id: process.env.Razor_Key_Id,
    key_secret: process.env.Razor_Sec_Key,
});

paymentRoute.post('/payment', async(req, res)=> {
    const { price } = req.body;
    try{
        const options = {
            amount: price *100, 
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };
        const order = await instance.orders.create(options);
        res.status(200).json(order);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create Razorpay order" });
    }
})

export default paymentRoute;
```

## Models
### user.model.js
```
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone:{
        type: String,
        required: false,
        unique: true,
    },
    role: {
        type: String,
        default: "user"
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
    isVarified: {
        type: Boolean,
        default: false, 
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpiresAt: {
        type: Date,
    },
    varificationToken: {
        type: String,
    },
    varificationTokenExpiresAt: {
        type: Date,
    },
}, {timestamps: true});

export const User = mongoose.model("User", userSchema);
```
### product.model.js
```
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Please enter product name'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please enter product description'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Please enter product price'],
      min: [0, 'Price cannot be less than 0']
    },
    quantity: {
      value: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        enum: ['kg', 'g', 'litre', 'ml', 'pcs'],
        required: true
      }
    },
    
    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    image: [
        {
            public_id: {
              type: String,
              required: true
            },
            url: {
              type: String,
              required: true
            }
        }
    ],
      
    category: {
      type: String,
      required: [true, 'Please enter product category'],
      trim: true
    },
    stock: {
      type: Number,
      required: [true, 'Please enter product stock'],
      min: [0, 'Stock cannot be less than 0'],
      default: 1
    },
    noOfReviews: {
      type: Number,
      default: 0
    },
    reviews: [
        {
            name: 
            {
                type: String,
                required: true
            },
            rating:{
                type: Number,
                required: true
            },
            comment:{
                type: String,
                required: true
            }
        }

    ],
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });
  
  const Product = mongoose.model('Product', productSchema);
  
  export default Product;
  ```
### cart.model.js
```
import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
      quantity: {
        type: Number,
        default: 1
      },
      source: {
        type: String, // optional: "ocr" or "manual"
        default: "manual"
      }
    }
  ]
});

export default mongoose.model("Cart", cartSchema);
```
### order.model.js
```
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customerDetails: {
    name: String,
    address: String,
    zip: Number,
    email: String,
    phone: Number,
  },
  cartItems: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      name: String,
      price: Number,
      image: [
        {
          public_id: String,
          url: String,
          _id: String,
        },
      ],
      category: String,
      stock: Number,
      quantity: Number,
      description: String,
      source: String,
    },
  ],
  totalAmount: Number,
  paymentMode: { type: String, required: true, enum: ["cashOnDelivery", "online"] },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
```
### newsletter.model.js
```
import Mongoose from 'mongoose';

const newsletterSchema = new Mongoose.Schema({
  email: { type: String, required: true, unique: true },
  time: { type: Date, default: Date.now }
});

const Newsletter = Mongoose.model('Newsletters', newsletterSchema);
export default Newsletter;
```
### image.model.js
``` 
import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema({
    name: String,
    imageUrl: String
});

const ImageModel = mongoose.model("lists", ImageSchema);
export default ImageModel;
```

## Middlewares
### error.js
```
import HandleError from '../utils/handleError.js';

export default (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    if(err.name === 'CastError') {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new HandleError(message, 404);
    }

    // mongodb duplicate key error
    if(err.code === 11000) {
        const message = `This ${Object.keys(err.keyValue)} already exists. Please try again.`;
        err = new HandleError(message, 404);
    }
    res.status(err.statusCode).json({
        success: false,
        message: err.message
    })
}
```
### handleAsuncError.js
```
export default (myErrorFun) => (req, res, next) => {
    Promise.resolve(myErrorFun(req, res, next)).catch(next);
}
```
### verifyToken.js
```
import jwt from 'jsonwebtoken';
import handleAsyncError from './handleAsyncError.js';
import { User } from '../models/user.model.js';
import HandleError from '../utils/handleError.js';

export const verifyToken = handleAsyncError(async (req, res, next) => {
  // Get token from cookies
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - no token provided',
    });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user information to the request object
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    req.user = user; // Attach full user information
    req.userId = user._id; // Attach only userId for easier access in other controllers
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export const roleBasedAccess = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new HandleError(
                `Role: ${req.user.role} is not allowed to access this resource`, 403
            ));
        }
        next();
    }
}
```

## NodeMailer
### email.config.js
```
import nodemailer from 'nodemailer'
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const mailTranporter = nodemailer.createTransport({
  secure: true,
  host: 'smtp.gmail.com',
  port: 465,
  auth:{
    user: process.env.FROM_MAIL,
    pass: process.env.FROM_MAIL_PASS
  }
})

```
### email.js
```
import { mailTranporter } from "./mailtrap.config.js";
import { VERIFICATION_EMAIL_TEMPLATE, WELCOME_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } from "./emailTemplate.js";

export const sendVarificationEmail = async (email, varificationToken) => {
    try {
        const response = await mailTranporter.sendMail({
            from: "calender3434@gmail.com",
            to: email,
            subject: "Varify you email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", varificationToken),
            category: "Email Verification",
        })
        console.log("Email sent successfully:", response);
    } catch (error) {
        throw new Error(`Error sending varification email: ${error}`)
    }
}

export const sendWelcomeEmail = async (email, name) => {

    try {
        const response = await mailTranporter.sendMail({
            from: "calender3434@gmail.com",
            to: email,
            subject: "Varify you email",
            html: WELCOME_TEMPLATE.replace("{name}", name),
            text: `Welcome ${name}, we are glad to have you on board`,
            category: "Welcome",
        })
        console.log("Welcome Email sent successfully:", response);
    } catch (error) {
        
    }
}

export const sendPasswordResetEmail = async (email, resetURL) => {
    try {
        console.log(resetURL)
        const response = await mailTranporter.sendMail({
            from: "calender3434@gmail.com",
            to: email,
            subject: "Reset your password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            category: "Password reset",
        })
        console.log("Password reset request Email sent successfully:", response);

    } catch (error) {
        console.error(error)
        throw new Error(`Error sending password reset email: ${error}`)
    }
}


export const sendResetSuccessEmail = async (email) => {
    try {
        const response = await mailTranporter.sendMail({
            from: "calender3434@gmail.com",
            to: email,
            subject: "Password reset successfull",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password reset",
        })
        console.log("Password reset Email sent successfully:", response);

    } catch (error) {
        console.error(error)
        throw new Error(`Error sending password reset successfull email: ${error}`)
    }
}
```

### emailTemplate.js
```
export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Verify Your Email</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>Thank you for signing up! Your verification code is:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50;">{verificationCode}</span>
    </div>
    <p>Enter this code on the verification page to complete your registration.</p>
    <p>This code will expire in 15 minutes for security reasons.</p>
    <p>If you didn't create an account with us, please ignore this email.</p>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;


export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset Successful</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We're writing to confirm that your password has been successfully reset.</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #4CAF50; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; font-size: 30px;">
        ✓
      </div>
    </div>
    <p>If you did not initiate this password reset, please contact our support team immediately.</p>
    <p>For security reasons, we recommend that you:</p>
    <ul>
      <li>Use a strong, unique password</li>
      <li>Enable two-factor authentication if available</li>
      <li>Avoid using the same password across multiple sites</li>
    </ul>
    <p>Thank you for helping us keep your account secure.</p>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;


export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
    <p>To reset your password, click the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{resetURL}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
    </div>
    <p>This link will expire in 1 hour for security reasons.</p>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;


export const WELCOME_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to our website</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Welcome</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello, {name}</p>
    <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
    <p>To reset your password, click the button below:</p>
    
    <p>This link will expire in 1 hour for security reasons.</p>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;
```
### orderEmail.js
```
import nodemailer from "nodemailer";
import express from "express";

const orderEmail = express.Router();

orderEmail.post("/sendconfirmationemail", async (req, res) => {
    const { to, name, items, total, address, zip, email, phone } = req.body;

    const itemList = items.map(item => `${item.name} - ₹${item.price}`).join("<br>");

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.Company_Mail,
            pass: process.env.Company_Pass,
        },
    });

    const mailOptions = {
        from: `"ListKaro" <${process.env.Company_Mail}>`,
        to: `${to}, ${process.env.Company_Mail}`,
        subject: "Order Confirmation from Listkaro",
        html: `
        <div style="background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%); color: white; max-width: 500px; font-size: 18px; padding: 20px; border-radius: 30px;">
            <div style="display: flex; justify-content: center; align-items: center; gap: 10px; margin-bottom: 20px;">
                <img src="https://i.imgur.com/R2aSKKN.png" alt="Logo" height="60" width="60">
                <h2>ListKaro</h2>
            </div>

            <div style="background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%); padding: 20px; border-radius: 30px;">
                <p>
                Dear ${name}, <br><br>
                Thank you for shopping with ListKaro! 🧡 <br>
                We truly appreciate your order and hope you enjoy your items. <br><br>

                Here's some exciting news — our Weekly Deals are live now! <br>
                Get up to 80% OFF on daily essentials, dairy products, snacks, and more. Stock up and save big while the offers last!
                <br><br>       
                Visit our store for more information <br><br>
                👉 <a href="http://localhost:5173/" 
                    style="background: transparent; color: #00ffff; border: 2px solid #00ffff; padding: 10px 20px; border-radius: 8px; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; box-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff inset; text-decoration: none; display: inline-block;">
                    Visit Store
                </a>
                <br><br>
                Happy shopping! <br><br>
                Team ListKaro
                </p>
            </div>

            <div style="background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%); font-size: 16px; padding: 20px; border-radius: 30px;">
                <p><strong>Here is your Order Summary</strong></p>
                ${itemList}
                <p><strong>Total Amount to be paid:</strong> ₹${total}</p>
                <p style="font-size: 14px;">(Ignore if already paid)</p>
            </div>

            <div style="background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%); font-size: 16px; padding: 20px; border-radius: 30px;">
                <u style="font-size: 18px;">Billing Details</u>
                <p>Customer: ${name}</p>
                <p>Address: ${address}</p>
                <p>Zip Code: ${zip}</p>
                <p>Email: ${email}</p>
                <p>Phone: ${phone}</p>
            </div>
        </div>
        `,

    };
    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Confirmation email sent." });
    } catch (error) {
        console.error("Email error:", error);
        res.status(500).json({ message: "Failed to send email" });
    }
});

export default orderEmail;
```

## Utils
### apiFunctionality.js
```
class APIFunctionality {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
        if (this.queryStr.keyword && this.queryStr.keyword.trim() !== "") {
            const keyword = {
                name: {
                    $regex: this.queryStr.keyword,
                    $options: "i" // Case-insensitive search
                }
            };
            this.query = this.query.find({ ...keyword });
        } else {
            console.log("No keyword provided for search.");
        }

        return this;
    }
    filter(){
        let queryCopy = {...this.queryStr };
        const removeFields = ["keyword", "page", "limit"];
        removeFields.forEach(key => delete queryCopy[key])
        console.log(queryCopy)

        this.query = this.query.find(queryCopy)
        return this
    }
    pagination(resultPerPage) {
        const currentPage = Number(this.queryStr.page  || 1);
        const skip = resultPerPage * (currentPage -1);
        this.query = this.query.limit(resultPerPage).skip(skip);
        return this;
        
    }
}

export default APIFunctionality;
```
### generateTokenAndSetCookie.js
```
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
```
### generateVarificatioCode.js
```
export const generateVarificationCode = () => {
    // This generates a 6-digit random number as a string
    return Math.floor(100000 + Math.random() * 900000).toString();
    
}
```
### handleError.js
```
class HandleError extends Error{
	constructor(message, statusCode){
		super(message);
		this.statusCode = statusCode;
		Error.captureStackTrace(this, this.construtor)
	}
}

export default HandleError;
```
## <p align="center">Frontend</p>
### index.html
```
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React</title>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```
## src
### main.jsx
```
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```
### App.jsx
```
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import 'react-toastify/dist/ReactToastify.css';
import './App.css'

import Home from './pages/Home'
import UpList from "./pages/UpList";
import Profile from "./pages/Profile"
import About from "./pages/About";
import PaymentForm from './pages/PaymentForm'
import FAQ from './pages/FAQ'
import EmailVerificationPage from "./pages/EmailVerificationPage";
import LoginPage from "./pages/LoginPage"
import ForgotPasswordPage from "./pages/ForgotPasswordPage"
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Dashboard from "./adminpanel/Dashboard";
import ShoppingCart from "./pages/ShoppingCart";
import OrderPage from "./pages/OrderPage";
import Placed from "./pages/Placed";
import Navbar from "./pages/Navbar";
import Products from "./pages/Products"

import { ToastContainer } from 'react-toastify';

function AppContent() {
  const location = useLocation();

  // Define routes where Navbar should be hidden
  const hideNavbarRoutes = ["/adminpanel"];

  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}

      <div className={!shouldHideNavbar ? "pt-6" : ""} style={!shouldHideNavbar ? { paddingTop: "100px" } : {}}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/uploadlist" element={<UpList />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/completepayment" element={<PaymentForm />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/emailVerification" element={<EmailVerificationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/adminpanel" element={<Dashboard />} />
          <Route path="/shopping-cart" element={<ShoppingCart />} />
          <Route path="/products" element={<Products />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/orderplaced" element={<Placed />} />
        </Routes>
      </div>
      <ToastContainer />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
```
## pages
### Home.jsx
```
import React, { useState, useEffect } from "react";
import axios from 'axios';

import "./Home.css";
import './HomeDark.css';
import './HomeSmall.css';

function Home() {
    // const [showPopup, setShowPopup] = useState(false); 
    const [offerPopup, setofferPopup] = useState(false);
    const [offerPopupClose, setofferPopupClose] = useState(false);
    const [copied, setCopied] = useState(false);
    const [email, setEmail] = useState("");
    // const [LightMode, setLightMode] = useState(true); 

    useEffect(() => {
        const waiting = 15000;
        setTimeout(() => {
            if (!offerPopupClose) {
                setofferPopup(true);
            }
        }, waiting);

    }, [offerPopupClose]);

    const closeOfferPopup = () => {
        setofferPopup(false);
        setofferPopupClose(true);
    };

    const copytext = () => {
        navigator.clipboard.writeText('J&M')
            .then(() => {
                setCopied(true);
                setTimeout(() => {
                    setCopied(false);
                }, 15000);
            })
    }

    const handleEmailSubmission = async (e) => {
        e.preventDefault();

        if (!email) {
            alert("Please enter a valid email address.");
            return;
        }

        try {
            const res = await axios.post("http://localhost:5000/api/subscribe", { email });
            alert(res.data.message);
            setEmail("");
        } catch (err) {
            alert(err.response?.data?.message || "Failed! Something went wrong.");
        }
    };


    const [LightMode, setLightMode] = useState(true);

    const OnDarkMode = () => {
        const DarkMode = !LightMode;
        setLightMode(DarkMode);
        document.body.classList.toggle('dark');
        localStorage.setItem('theme', DarkMode ? 'light' : 'dark');
    }
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setLightMode(false);
            document.body.classList.add('dark');
        }
        else {
            setLightMode(true);
            document.body.classList.remove('dark');
        }
    }, []);

    return (
        <>
            {
                offerPopup && (
                    <div>
                        <div className="offerPopupContainer">

                            <div className="offerPopupContent">
                                <p onClick={closeOfferPopup} style={{ position: 'absolute', right: '15px', cursor: 'pointer', fontWeight: 'bold' }}>X</p>
                                <h3>GET UPTO 50% OFF</h3>
                                <p>Get Exciting offers! Starting from Rs 199/- Use Code <i>J&M</i> and enjoy 50% off upto Rs 250/-</p>
                                <button onClick={copytext} className="ccbtn"> {copied ? <i> Copied </i> : 'Copy Code'}</button>
                            </div>
                        </div>
                    </div>
                )
            }

            <div className="offer-banner">
                <div className="offer-text">
                    <span>🚚 Get Your Order Delivered in Just 45 Minutes!</span>
                    <span>📝 Upload Your Grocery List & Buy Everything at Once</span>
                    <span>📦 Free Delivery on Orders Above ₹499</span>
                    <span>🧀 Exclusive Discounts on All Dairy Products!</span>
                </div>
            </div>

            <section className="carocontainer">

                <div className="slide-wrapper">
                    <div className="slider">
                        <img src="/images/c1.jpg" alt="" id="slide1" />
                        <img src="/images/c2.jpg" alt="" id="slide2" />
                        <img src="/images/c3.jpg" alt="" id="slide3" />

                        <div className="slider-nav">
                            <a href="#slide1"></a>
                            <a href="#slide2"></a>
                            <a href="#slide3"></a>
                        </div>
                    </div>
                </div>

                <div className="card-container">
                    <img src="/images/snacks.jpg" className="card-image" alt="groceries" />
                    <div className="card-body">
                        <h5 className="card-title">Snacks</h5>
                        <p className="card-text">
                            Tasty Bites, Anytime! <br />
                            Explore our wide range of snacks – from crispy chips to healthy munchies. <br />
                            Perfect for your cravings, anytime, anywhere! <br /> <br />
                            <strong style={{ fontSize: '16px' }}>Get 20% off: Use Code "<em>IamHungry</em>" </strong> <br /> <br />
                        </p>
                        <a href="#" className="card-button">Buy Now</a>
                    </div>
                </div>

                <div className="card-container">
                    <img src="/images/groceries.jpg" className="card-image" alt="groceries" />
                    <div className="card-body">
                        <h5 className="card-title">Groceries</h5>
                        <p className="card-text">
                            Daily Essentials, Delivered Fresh! <br />
                            From farm-fresh vegetables to pantry staples – get everything you need in one place. <br />
                            Quality you trust, prices you'll love! <br /> <br />
                            <strong style={{ fontSize: '16px' }}>Get 10% off: use code "<em>FreshStart</em>" </strong> <br /> <br />
                        </p>
                        <a href="#" className="card-button">Buy Now</a>
                    </div>
                </div>
            </section>
            <hr />

            <h3 className="categoriestitle">Categories     <hr /> </h3>

            <section className="categories">

                <div className="circontainer">
                    <img src="/images/fruits.jpg" alt="" className="cirimage" />
                    <p>Fruits</p>
                </div>

                <div className="circontainer">
                    <img src="/images/vege.jpg" alt="" className="cirimage" />
                    <p>Vegetables</p>
                </div>

                <div className="circontainer">
                    <img src="/images/c3.jpg" alt="" className="cirimage" />
                    <p>Dairy Products</p>
                </div>

                <div className="circontainer">
                    <img src="/images/meat.jpg" alt="" className="cirimage" />
                    <p>Meat </p>
                </div>

                <div className="circontainer">
                    <img src="/images/snacks.jpg" alt="" className="cirimage" />
                    <p>Snacks </p>
                </div>

                <div className="circontainer">
                    <img src="/images/drink.jpg" alt="" className="cirimage" />
                    <p>Drinks</p>
                </div>


            </section>

            <section className="categories">

                <div className="circontainer">
                    <img src="/images/frozen.jpg" alt="" className="cirimage" />
                    <p>Frozen Foods</p>
                </div>

                <div className="circontainer">
                    <img src="/images/sweet.jpg" alt="" className="cirimage" />
                    <p>Sweets & Desserts</p>
                </div>

                <div className="circontainer">
                    <img src="/images/canned.jpg" alt="" className="cirimage" />
                    <p>Canned Foods</p>
                </div>

                <div className="circontainer">
                    <img src="/images/cake.jpg" alt="" className="cirimage" />
                    <p>Cakes and Breads</p>
                </div>

                <div className="circontainer">
                    <img src="/images/rice.jpg" alt="" className="cirimage" />
                    <p>Rice</p>
                </div>

                <div className="circontainer">
                    <img src="/images/biscuit.jpg" alt="" className="cirimage" />
                    <p>Biscuits</p>
                </div>


            </section>

            <hr />

            <section className="offer">
                <div className="offerimage">
                    <img src="/images/juice.png" alt="" className="offerimg" />
                </div>
                <div className="offercontainer">
                    <h3>GET REFRESHED THIS SUMMER! ☀️</h3>
                    <p>Buy 2 bottle of Orange juice and get one orange juice for Free</p>
                    <p id="star">*Terms and Conditions applicable</p>
                    <p id="price">Price : <del>99/-</del> Now only : 79/-</p>
                    <a href="" > <input type="button" value={'Buy Now'} /> </a>
                </div>


            </section>

            <hr />

            <section className="newsletter">
                <form className="newsletterhead" onSubmit={handleEmailSubmission}>
                    <h3>Get top deals, latest trends, and more.</h3>
                    <p>Join our email subscription now to get updates on promotions and coupons.</p>
                    <input type="email" placeholder="Enter email address" className="emailbox" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input type="submit" value={'Join now'} className="emailbtn" />
                </form>
                <img src={LightMode ? '/images/newsletterday.png' : '/images/newsletternight.png'} alt="" height={'400px'} width={'300px'} />
            </section>

            <hr />

            <footer>
                <div className="products">
                    <p>Caterogies</p>
                    <a href="">Dairy Products</a>
                    <a href="">Fruits</a>
                    <a href="">Vegies</a>
                    <a href="">Canned Products</a>
                    <a href="">Sweets</a>
                    <a href="">Snacks</a>
                    <a href="">Cookies</a>
                    <a href="">Cakes</a>

                </div>

                <div className="aboutus">
                    <p>About us</p>
                    <a href="/about">Company</a>
                    <a href="/about">Developers</a>
                    <a href="/about">Blog</a>
                    <a href="/about">Contact</a>
                </div>
                <div className="consumers">
                    <p>Customers</p>
                    <a href="/completepayment">Payment</a>
                    <a href="">Delivery</a>
                    <a href="">Return </a>
                    <a href="/faq">FAQ</a>
                </div>
                <div className="programs">
                    <p>Programs</p>
                    <a href="">Offers</a>
                    <a href="">Gift Cards</a>
                    <a href="">Vouchars </a>
                    <a href="">Career</a>
                </div>
            </footer>
            <hr />
        </>
    );
}

export default Home;
```
### Navbar.jsx
```
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import SignUp from "./Signup";
import { useAuthStore } from '../store/authStore';
import { ShoppingCart, Menu, X, User, Upload, Info, Package, LogOut } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCartStore } from "../store/authStore";
import './Home.css';
import './HomeDark.css';

export default function Navbar() {
    const [showPopup, setShowPopup] = useState(false);
    const [lightMode, setLightMode] = useState(true);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [showSubTabs, setShowSubTabs] = useState(false);
    const { user, logout, isAuthenticated } = useAuthStore();
    const { getCartCount } = useCartStore();
    const navigate = useNavigate();
    const cartCount = isAuthenticated ? getCartCount() : 0;

    const userDropdownRef = useRef(null);
    const sidebarRef = useRef(null);

    const toggleDarkMode = () => {
        const newMode = !lightMode;
        setLightMode(newMode);
        document.body.classList.toggle("dark");
        localStorage.setItem("theme", newMode ? "light" : "dark");
    };

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            setLightMode(false);
            document.body.classList.add("dark");
        } else {
            setLightMode(true);
            document.body.classList.remove("dark");
        }
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Logged out successfully");
            setShowUserDropdown(false);
            navigate("/");
        } catch (error) {
            console.log(error);
            toast.error("Failed to logout");
        }
    };

    const handleClickOutside = (event) => {
        if (
            userDropdownRef.current &&
            !userDropdownRef.current.contains(event.target)
        ) {
            setShowUserDropdown(false);
        }

        if (
            sidebarRef.current &&
            !sidebarRef.current.contains(event.target) &&
            !event.target.closest(".nav-toggle-icon")
        ) {
            setShowSidebar(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            <nav className="my-navbar fixed top-0 z-50 dark:bg-gray-800 text-gray-800 dark:text-white shadow-md w-full  duration-300">
                <div className="nav-holder max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <img src="/images/logo.png" alt="logo" className="h-8 w-8" />
                        <Link to="/" className="text-xl font-bold my-brand">ListKaro</Link>
                    </div>

                    <div className="hidden lg:flex items-center gap-4">
                        <input
                            type="search"
                            placeholder="Search for items"
                            className="searchinput px-3 py-1 rounded-md border dark:border-gray-600 dark:bg-gray-700 text-sm focus:outline-none"
                        />
                        <Link to="/uploadlist" className="flex gap-2 text-sm font-semibold upload-list-lg">
                            <Upload size={20} className="text-gray-800 dark:text-white" />One Click Shopping
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/shopping-cart" className="relative px-1 py-1 rounded-md text-sm hover:bg-green-700 transition">
                            <ShoppingCart size={24} className="nav-cart-icon" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">{cartCount}</span>
                            )}
                        </Link>

                        <img
                            src={lightMode ? "/images/sun.png" : "/images/moon.png"}
                            onClick={toggleDarkMode}
                            alt="Toggle Theme"
                            className="w-6 h-6 cursor-pointer"
                        />

                        <div className="relative" ref={userDropdownRef}>
                            <User
                                onClick={() => setShowUserDropdown(!showUserDropdown)}
                                size={24}
                                className="cursor-pointer nav-user-icon"
                            />
                            {showUserDropdown && (
                                <div className="absolute right-0 mt-2 w-40 nav-dropdown bg-gray-800 dark:bg-gray-700 border dark:border-gray-600 rounded shadow-lg text-sm z-50">
                                    {isAuthenticated && user && (
                                        <div className="block px-4 py-2 text-white font-semibold">
                                            Hello, {user.name}
                                        </div>
                                    )}
                                    <hr />
                                    {!isAuthenticated && (
                                        <>
                                            <Link
                                                to="/login"
                                                className="block px-4 py-2 text-bold hover:bg-gray-100 dark:hover:bg-gray-600 nav-dropdown-link"
                                                onClick={() => setShowUserDropdown(false)}
                                            >
                                                Login
                                            </Link>
                                            <Link
                                                to="/signup"
                                                className="block px-4 py-2 text-bold hover:bg-gray-100 dark:hover:bg-gray-600 nav-dropdown-link"
                                                onClick={() => {
                                                    setShowPopup(true);
                                                    setShowUserDropdown(false);
                                                }}
                                            >
                                                Signup
                                            </Link>
                                        </>
                                    )}
                                    {isAuthenticated && (
                                        <Link
                                            to="/orders"
                                            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 nav-dropdown-link uorders"
                                        >
                                            <Package className="w-5 h-5" /> Your Orders
                                        </Link>
                                    )}
                                    <hr className="border-gray-600 my-2" />
                                    {isAuthenticated && (
                                        <Link
                                            to="/"
                                            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 nav-dropdown-link ulogout"
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="w-5 h-5" /> Logout
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="block">
                            <button onClick={() => setShowSidebar(true)}>
                                <Menu className="w-6 h-6 nav-toggle-icon dark:text-white" />
                            </button>
                        </div>
                    </div>
                </div>

                {showSidebar && (
                    <div
                        ref={sidebarRef}
                        className="fixed top-0 right-0 h-full w-80 nav-mob-screen-dropdown shadow-lg z-50 transform transition-transform duration-300 ease-in-out translate-x-0"
                    >
                        <div className="flex justify-between items-center p-4 border-b dark:border-gray-600 bg-orange-300 menuheader">
                            <span className="text-lg font-semibold nav-sidebarheader-text dark:text-white">Menu</span>
                            <button onClick={() => setShowSidebar(false)}>
                                <X className="w-5 h-5 nav-sidebar-close" />
                            </button>
                        </div>

                        <div className="menucontainer p-0 bg-orange-200 h-full">
                            <input type="search" placeholder="Search for items" className="searchinput m-4 w-full px-3 py-2 mb-4 rounded-md border dark:border-gray-600 dark:bg-gray-700 text-sm focus:outline-none" />
                            <Link to="/uploadlist" className="flex gap-2 items-center text-sm font-semibold upload-list px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                                <Upload size={20} className="text-gray-800 dark:text-white" />
                                One Click Shopping
                            </Link>
                            <div>
                                <Link
                                    to="#"
                                    className="flex items-center gap-2 text-sm font-semibold upload-list px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={() => setShowSubTabs(prev => !prev)}
                                >
                                    <Package size={20} className="text-gray-800 dark:text-white" />
                                    All Products
                                </Link>

                                {showSubTabs && (
                                    <div className="pl-6 mt-2 space-y-2">
                                        <Link to="/dairy-products" className="block text-sm no-underline text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded">Dairy Products</Link>
                                        <Link to="/Fruits" className="block text-sm no-underline text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded">Fruits</Link>
                                        <Link to="/vegetables" className="block text-sm no-underline text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded">Vegetables</Link>
                                        <Link to="/canned-products" className="block text-sm no-underline text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded">Canned Products</Link>
                                        <Link to="/products" className="block text-sm no-underline text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded">All Products</Link>
                                    </div>
                                )}

                            </div>

                            <Link to="/about" className="flex items-center gap-2 text-sm font-semibold upload-list px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                                <Info size={20} className="text-gray-800 dark:text-white" />
                                About
                            </Link>

                            <Link to="/adminpanel" className="flex items-center gap-2 text-sm font-semibold upload-list px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                                <Info size={20} className="text-gray-800 dark:text-white" />
                                Admin Panel
                            </Link>
                        </div>
                    </div>
                )}
                <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
            </nav>

            <SignUp showPopup={showPopup} setShowPopup={setShowPopup} />
        </>
    );
}
```
### About.jsx
```
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Ensure this is installed and available
import './About.css';
import './AboutDark.css';
import './AboutSmall.css';

function About() {
    const [currContent, setcurrContent] = useState('company');
    const [LightMode, setLightMode] = useState(true);

    const OnDarkMode = () => {
        const DarkMode = !LightMode;
        setLightMode(DarkMode);
        document.body.classList.toggle('dark');
        localStorage.setItem('theme', DarkMode ? 'light' : 'dark');
    };

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setLightMode(false);
            document.body.classList.add('dark');
        } else {
            setLightMode(true);
            document.body.classList.remove('dark');
        }
    }, []);

    const content = () => {
        switch (currContent) {
            case 'company':
                return (
                    <>
                        <div className="logocontainer">
                            <img src="/images/logo.png" alt="Logo" />
                            <h1>ListKaro</h1>
                        </div>
                        <hr />
                        <div className="companydetails">
                            <p>
                                <strong>ListKaro</strong> is your one-stop online destination for all your grocery and food essentials.
                                From fresh — <br /> <b>dairy products and pantry staples to canned goods, snacks, chocolates, cakes,</b> and more<br />
                                we bring everything you need right to your doorstep.<br /><br />
                                <ul>
                                    <li>Enjoy <strong>free delivery</strong> on orders above ₹499</li>
                                    <li>Superfast delivery within <strong>45 minutes</strong></li>
                                    <li><strong>Upload Your Grocery List</strong> & Buy Everything at Once</li>
                                    <li>Exclusive <strong>Discounts</strong> on All Dairy Products!</li>
                                </ul><br />
                                What makes ListKaro truly unique is our <strong>smart list upload</strong> feature —
                                customers can simply upload an image or file of their handwritten or typed shopping list,<br />
                                and our AI technology will automatically detect the items and create a cart, ready for checkout in seconds.
                                Say goodbye to manual searches and hello to effortless shopping!<br />
                                We support multiple secure payment methods through trusted partners like <strong>Visa, PhonePe, Paytm, UPI</strong>, and more,
                                making your checkout smooth and reliable.<br />
                                With ListKaro, shopping is not just faster — it's smarter.
                            </p>
                            <img src={LightMode ? '/images/hq.png' : '/images/hqnight.png'} alt="Headquarters" height="600px" width="600px" />
                        </div>
                    </>
                );

            case 'developers':
                return (
                    <>
                        <div className="jabed">
                            <div className="details">
                                <h2>Md Abu Jabed</h2>
                                <h6>BCA Student</h6>
                                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit...</p>
                            </div>
                            <div className="dp">
                                <img src="/images/jabed.jpg" alt="Md Abu Jabed" width="500px" height="300px" />
                            </div>
                        </div>
                        <hr />
                        <div className="indadul">
                            <div className="dp">
                                <img src="/images/indadul.png" alt="Indadul Hoque" width="500px" height="300px" />
                            </div>
                            <div className="details">
                                <h2>Indadul Hoque</h2>
                                <h6>BCA Student</h6>
                                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit...</p>
                            </div>
                        </div>
                    </>
                );

            case 'project':
                return (
                    <>
                        <h1 style={{ textAlign: 'center' }}>ListKaro OCR Project</h1>
                        <hr />
                        <section className="projectcontainer">
                            <p>
                                The <strong>ListKaro</strong> project is an innovative eCommerce platform designed to streamline the
                                shopping experience by leveraging Optical Character Recognition (OCR) technology...
                            </p>
                            <img
                                src={LightMode ? '/images/employee.png' : '/images/employeenight.png'}
                                alt="Project Overview"
                                height="400px"
                                width="600px"
                                style={{ borderRadius: '10px' }}
                            />
                        </section>
                    </>
                );

            case 'technologies':
                return (
                    <>
                        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Technologies Used</h2>
                        <div className="tech-card-container">
                            <div className="tech-card">React.js</div>
                            <div className="tech-card">Node.js & Express.js</div>
                            <div className="tech-card">MongoDB (MERN Stack)</div>
                            <div className="tech-card">Microsoft Azure OCR API</div>
                            <div className="tech-card">Bootstrap & CSS Modules</div>
                            <div className="tech-card">React Router DOM</div>
                        </div>

                    </>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <nav>
                <div className="aboutcontainer d-flex">
                    <ul>
                        <li><Link to="/" className='backToHome'>Home</Link></li>
                        <li onClick={() => setcurrContent('company')}>Company</li>
                        <li onClick={() => setcurrContent('developers')}>Developers</li>
                        <li onClick={() => setcurrContent('project')}>Project</li>
                        <li onClick={() => setcurrContent('technologies')}>Technologies Used</li>
                        <li>
                            <img
                                src={LightMode ? '/images/sun.png' : '/images/moon.png'}
                                onClick={OnDarkMode}
                                alt="Toggle Theme"
                                className="sunmoonicon"
                            />
                        </li>
                    </ul>
                </div>
            </nav>

            <div className="content">
                {content()}
            </div>
        </>
    );
}

export default About;
```
### FAQ.jsx
```
import React, { useState } from 'react';
import './FAQ.css'

const questions = [
    {
        ques: 'What is ListKaro?',
        ans: 'ListKaro lets you upload a handwritten or printed shopping list, then auto-adds items to your cart using OCR.',
    },
    {
        ques: 'What kind of images can I upload?',
        ans: 'Clear JPG, PNG, or JPEG images of handwritten or printed lists with visible text.',
    },
    {
        ques: 'What if an item isn’t found?',
        ans: 'You’ll get a notice. You can search manually or request us to add it later.',
    },
    {
        ques: 'Is my data safe?',
        ans: 'Yes. Your images and data are processed securely and deleted after use.',
    },
];

function FAQ() {
    const [activeQuestion, setActiveQuestion] = useState(null);
    const OpenAnswer = (index) => {
        setActiveQuestion(activeQuestion === index ? null : index);
    };
    return (
        <>
            <div className="faqcontainer">
                <h3>Frequently Asked Questions</h3>
                <p>We got you covered</p>
                {
                    questions.map((item, index) => (
                        <div key={index} className="faqitem">

                            <button onClick={() => OpenAnswer(index)} className="faq-question"> {item.ques} </button>
                            {
                                activeQuestion === index && (
                                    <div className="faqanswer"> <p>{item.ans}</p> </div>
                                )}

                        </div>
                    ))}
            </div>
        </>
    )
}

export default FAQ
```
### Signup.jsx
```
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SignUp = ({ showPopup, setShowPopup }) => {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegistration = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:5000/api/auth/signup", formData);
            console.log("User registered:", response.data);
            toast.success("Verify Your Email");
            setShowPopup(false);
            navigate("/emailVerification");
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Registration failed. Please try again.";
            console.error("Registration error:", errorMessage);
            toast.error(errorMessage);  
        }
    };

    if (!showPopup) return null;  

    return (
        <div className="signupcontainer">
            <div className="signheader">
                <span className="signuptitle">Sign Up</span>
                <span onClick={() => setShowPopup(false)} className="close"> X </span>
            </div>

            <form onSubmit={handleRegistration}>
                <input name="name" type="text" placeholder="Enter your name" required value={formData.name} onChange={handleChange} /><br />
                <input name="email" type="email" placeholder="Enter your email" required autoComplete="off" value={formData.email} onChange={handleChange} /><br />
                <input name="password" type="password" placeholder="Set a password" required autoComplete="off" value={formData.password} onChange={handleChange} /><br />
                <input name="phone" type="tel" placeholder="Phone Number (Optional)"
                    value={formData.phone}
                    onChange={handleChange}
                />
                <br />
                By signing up, you agree to our <a href="" style={{ textDecoration: 'none' }}>terms and conditions</a><br /><br />
                <input type="submit" value="Signup" className="signupbtn" />
            </form>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
            <p style={{ textAlign: 'center' }} className="ahac">Already have an account? <a href="/login" style={{ textDecoration: 'none' }}>Log in</a></p>
            
            {/* Always render ToastContainer */}
            
        </div>
    );
};

export default SignUp;
```
### LoginPage.jsx
```
import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Mail, Lock, Loader } from "lucide-react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import "./LoginPage.css";

const LoginPage = () => {
    const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { login, isLoading, error } = useAuthStore();
	const navigate = useNavigate();
  	const location = useLocation();
  	const from = location.state?.from?.pathname || "/";

	const handleLogin = async (e) => {
		e.preventDefault();
		try {
			await login(email, password);
			toast.success("You are logged in successfully");
			
			setTimeout(() => {
				navigate(from, { replace: true }); 
			}, 2000);
		} catch (error) {
			const errorMessage =
				error.response?.data?.message || error.message || "Login failed. Please try again.";
			console.error("Login error:", errorMessage);
			toast.error(errorMessage);
		}
	};
    return (
		<>
		
        <div className="login-page">
			<div className="login-card">
				<h2>Welcome Back</h2>
				<form onSubmit={handleLogin}>
					<div className="logininput-group">
						<Mail className="input-icon" />
						<input
							type="email"
							placeholder="Email Address"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
					<div className="logininput-group">
						<Lock className="input-icon" />
						<input
							type="password"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>
					<div className="forgot">
                        <Link to='/forgot-password'>
							Forgot password?
						</Link>
					</div>
                    {error && <p className='text-red font-semibold mb-2'>{error}</p>}

					<button type="submit" className="login-btn" disabled={isLoading}>
						{isLoading ? "Logging in..." : "Login"}
					</button>
				</form>
				<p className="signup-link">
					Don't have an account? <a href="/register">Sign up</a>
				</p>
			</div>
			<ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
		</div>
		</>
    );
};

export default LoginPage;
```
### ForgotPasswordPage.jsx
```
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { ArrowLeft, Loader, Mail } from "lucide-react";
import "./LoginPage.css";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const { isLoading, forgotPassword } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await forgotPassword(email);
        setIsSubmitted(true);
    };
    return (
        <div className="login-page">
            <div className="login-card">
                <h2>Forgot Password</h2>
                {!isSubmitted ? (
                    <form onSubmit={handleSubmit}>
                        <div className="logininput-group">
                            <Mail className="input-icon" />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="login-btn" disabled={isLoading}>
                            {isLoading ? (
                                <Loader className="spinner-border text-light mx-auto d-block" />
                            ) : (
                                "Send Reset Link"
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="text-center">
                        <div
                            className="d-flex align-items-center justify-content-center mx-auto mb-4 rounded-circle bg-success"
                            style={{
                                width: "64px",
                                height: "64px",
                                transform: "scale(1)",
                                transition: "transform 0.5s ease-out"
                            }}
                        >
                            <Mail className="text-white" style={{ width: "32px", height: "32px" }} />
                        </div>
                        <p className="text-light mb-4">
                            If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
                        </p>
                    </div>

                )}
                <div className="py-3 px-4 w-100 mt-2" style={{ backgroundColor: "#0e0f1c", borderBottomLeftRadius: "12px", borderBottomRightRadius: "12px", maxWidth: "420px" }}>
                    <div className="d-flex justify-content-center">
                        <Link
                            to="/login"
                            className="text-success text-decoration-none d-flex align-items-center small fw-semibold"
                        >
                            <ArrowLeft className="me-2" style={{ width: "16px", height: "16px" }} />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
            
        </div>
    );
};

export default ForgotPasswordPage;
```
### ResetPasswordPage.jsx
```
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Lock } from "lucide-react";
import "./LoginPage.css";

const ResetPasswordPage = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { resetPassword, error, isLoading, message } = useAuthStore();

    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        try {
            await resetPassword(token, password);

            toast.success("Password reset successfully, redirecting to login page...");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Error resetting password");
        }
    };
    return (
        <div className="login-page">
            <div className="login-card">
                <h2>Reset Password</h2>
                {error && <p className="text-danger small mb-3">{error}</p>}
                {message && <p className="text-success small mb-3">{message}</p>}

              
                    <form onSubmit={handleSubmit}>
                        <div className="logininput-group">
                            <Lock className="input-icon" />
                            <input
                                type='password'
                                placeholder='New Password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="logininput-group">
                            <Lock className="input-icon" />
                            <input
                                type='password'
                                placeholder='Confirm New Password'
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="login-btn" disabled={isLoading}>
                            {isLoading ? "Resetting..." : "Set New Password"}
                        </button>
                    </form>
            </div>

        </div>
    );
};

export default ResetPasswordPage;
```
### EmailVerificationPage.jsx
```
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function EmailVerificationPage() {
	const [code, setCode] = useState(["", "", "", "", "", ""]);
	const inputRefs = useRef([]);
	const navigate = useNavigate();
	const { error, isLoading, verifyEmail } = useAuthStore();

	const handleChange = (index, value) => {
		const newCode = [...code];

		if (value.length > 1) {
			const pastedCode = value.slice(0, 6).split("");
			for (let i = 0; i < 6; i++) {
				newCode[i] = pastedCode[i] || "";
			}
			setCode(newCode);
			const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
			const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
			inputRefs.current[focusIndex].focus();
		} else {
			newCode[index] = value;
			setCode(newCode);
			if (value && index < 5) {
				inputRefs.current[index + 1].focus();
			}
		}
	};

	const handleKeyDown = (index, e) => {
		if (e.key === "Backspace" && !code[index] && index > 0) {
			inputRefs.current[index - 1].focus();
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const verificationCode = code.join("");
		try {
			await verifyEmail(verificationCode);
			navigate("/login");
			toast.success("Email verified successfully");
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		if (code.every((digit) => digit !== "")) {
			handleSubmit(new Event("submit"));
		}
	}, [code]);

	return (
		<div className="container mt-5 d-flex justify-content-center">
			<div className="card p-4 shadow-lg" style={{ maxWidth: "400px", width: "100%" }}>
				<h2 className="text-center mb-3 text-success">Verify Your Email</h2>
				<p className="text-center text-muted mb-4">
					Enter the 6-digit code sent to your email address.
				</p>
				<form onSubmit={handleSubmit}>
					<div className="d-flex justify-content-between mb-3">
						{code.map((digit, index) => (
							<input
								key={index}
								ref={(el) => (inputRefs.current[index] = el)}
								type="text"
								maxLength="1"
								value={digit}
								onChange={(e) => handleChange(index, e.target.value)}
								onKeyDown={(e) => handleKeyDown(index, e)}
								className="form-control text-center mx-1"
								style={{
									width: "50px",
									height: "50px",
									fontSize: "1.5rem",
									fontWeight: "bold",
								}}
							/>
						))}
					</div>
					{error && (
						<p className="text-danger text-center fw-semibold">{error}</p>
					)}
					<button
						type="submit"
						className="btn btn-success w-100"
						disabled={isLoading || code.some((digit) => !digit)}
					>
						{isLoading ? "Verifying..." : "Verify Email"}
					</button>
				</form>
			</div>
		</div>
	);
}
```
### Uplist.jsx
```
import './UpList.css';
import './UpListDark.css';
import './UpListSmall.css';
import { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { useBulkUploadStore } from '../store/authStore';
import { useAuthStore } from '../store/authStore';

function UpList() {
    const [ocrText, setOcrText] = useState([]);
    const [productInputs, setProductInputs] = useState([{ name: '', quantity: '' }]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [ocrResult, setOcrResult] = useState(null);

    const navigate = useNavigate();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setOcrResult(null);
            setErrorMsg('');
        }
    };

    const upload = async () => {
        if (!isAuthenticated) {
            toast.warn("Please log in to upload.");
            navigate('/login');
            return;
        }

        if (!selectedImage) {
            toast.error("Please select a file");
            return;
        }

        const validTypes = ["image/jpeg", "image/png"];
        if (!validTypes.includes(selectedImage.type)) {
            toast.error("Please upload a valid JPG or PNG image");
            return;
        }

        const formData = new FormData();
        formData.append('image', selectedImage);

        setLoading(true);
        setErrorMsg('');
        setOcrResult(null);

        try {
            const response = await axios.post(
                'http://localhost:5000/api/upload-ocr',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    withCredentials: true,
                }
            );

            if (response.data?.lines) {
                const extractedItems = extractItems(response.data.lines);
                setOcrText(extractedItems);
                toast.success("File uploaded and list extracted successfully!");
            } else {
                toast.error("Failed to extract list items!");
            }

            setOcrResult(response.data);
        } catch (error) {
            console.error('Upload failed:', error);
            if (error.response && error.response.status === 401) {
                setErrorMsg('Unauthorized. Please log in again.');
                toast.error('Unauthorized. Please log in again.');
            } else {
                setErrorMsg('Upload failed. Please try again.');
                toast.error('Upload failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const extractItems = (lines) => {
        const pattern = /^(.*)\s+(\d+(?:\.\d+)?\s*(?:kg|gm|g|ml|litre|l|pcs)?)$/i;

        return lines.map(line => {
            const match = line.match(pattern);
            if (match) {
                return {
                    name: match[1].trim().toLowerCase(),
                    quantity: match[2].trim(),
                };
            } else {
                const words = line.trim().split(" ");
                const name = words.slice(0, -1).join(" ");
                const quantity = words.slice(-1).join("");
                return {
                    name: name.toLowerCase(),
                    quantity,
                };
            }
        });
    };

    const handleChange = (index, field, value) => {
        const updated = [...productInputs];
        updated[index][field] = value;
        setProductInputs(updated);
    };

    const addNewProductField = () => {
        setProductInputs([...productInputs, { name: '', quantity: '' }]);
    };

    const removeProductField = (index) => {
        const updated = [...productInputs];
        updated.splice(index, 1);
        setProductInputs(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            toast.warn("Please log in to upload.");
            navigate('/login');
            return;
        }

        try {
            await useBulkUploadStore.getState().bulkUploadProducts(productInputs);
            toast.success("Bulk upload successful!");
            setProductInputs([{ name: '', quantity: '' }]);
        } catch (error) {
            toast.error("Failed to bulk upload products.");
            console.error("Bulk upload error:", error);
        }
    };

    return (
        <>
            <div className="container list-upload-container rounded uphead ">
                <h2 className="text-start mb-2" id="uploadtitle">Upload Your List or Fill the Form</h2>
                <p className="text-start">
                    Please upload list as the <strong>.jpg or .png</strong> format
                </p>
                <hr />
                <div className="row justify-content-center">
                    <div className="col-12 col-md-10 col-lg-8">
                        <div className="d-flex flex-column flex-lg-row gap-4">

                            {/* Upload Section */}
                            <div className="flex-fill text-center p-3 border rounded shadow-sm bg-gray-800">
                                <div className="mb-3 upsection">
                                    <label htmlFor="fileId" className="d-block cursor-pointer">
                                        <img src="/images/upload.png" alt="Upload" style={{ maxWidth: '100px', cursor: 'pointer' }} />
                                    </label>
                                    <input
                                        type="file"
                                        id="fileId"
                                        className="form-control mt-2"
                                        accept="image/png, image/jpeg"
                                        onChange={handleFileChange}
                                    />
                                    <button onClick={upload} className="btn btn-primary mt-3 w-100">
                                        {loading ? 'Uploading...' : 'Upload'}
                                    </button>
                                </div>

                                {selectedImage && (
                                    <div className="mt-3">
                                        <p><strong>Selected File:</strong> {selectedImage.name}</p>
                                        {previewUrl && (
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="img-fluid rounded"
                                                style={{ maxHeight: '200px' }}
                                            />
                                        )}
                                    </div>
                                )}

                                {errorMsg && (
                                    <div className="alert alert-danger mt-3">{errorMsg}</div>
                                )}
                            </div>

                            {/* OR Divider (visible only on medium+) */}
                            <div className="d-none d-lg-flex align-items-center justify-content-center">
                                <span className="fw-bold">OR</span>
                            </div>

                            {/* Manual Form Section */}
                            <div className="flex-fill p-3 border rounded shadow-sm bg-dark text-white">
                                <form onSubmit={handleSubmit}>
                                    {productInputs.map((product, index) => (
                                        <div key={index} className="d-flex flex-column flex-md-row align-items-center gap-2 mb-3">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Product Name (e.g Egg, Milk)"
                                                value={product.name}
                                                onChange={(e) => handleChange(index, 'name', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Quantity (e.g 20kg, 200ml, 7p)"
                                                value={product.quantity}
                                                onChange={(e) => handleChange(index, 'quantity', e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeProductField(index)}
                                                className="btn btn-outline-light"
                                            >
                                                <img src="/images/dustbin.png" alt="Remove" style={{ width: '50px', backgroundColor: 'white' }} />
                                            </button>
                                        </div>
                                    ))}

                                    <div className="d-grid gap-2 d-md-flex justify-content-between mt-3">
                                        <button type="button" onClick={addNewProductField} className="btn btn-outline-success w-100 w-md-auto">
                                            Add New Product +
                                        </button>
                                        <button type="submit" className="btn btn-primary w-100 w-md-auto">
                                            Upload
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
            </div>
        </>
    );
}

export default UpList;
```
### Products.jsx
```
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './HomeDark.css';
import { Star, StarHalf } from 'lucide-react';

const ProductList = () => {
    const [products, setProducts] = useState({});

    useEffect(() => {
        axios.get('http://localhost:5000/api/products/getAllProducts')
            .then(res => {
                const allProducts = res.data.data;
                const grouped = {};

                allProducts.forEach(product => {
                    const category = product.category || 'Others';
                    if (!grouped[category]) {
                        grouped[category] = [];
                    }
                    grouped[category].push(product);
                });

                setProducts(grouped);
            })
            .catch(err => {
                console.error("Error fetching products:", err);
            });
    }, []);

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={`full-${i}`} fill="yellow" strokeWidth={0} size={20} className="me-1" />);
        }

        if (hasHalfStar) {
            stars.push(<StarHalf key="half" fill="yellow" strokeWidth={0} size={20} className="me-1" />);
        }

        while (stars.length < 5) {
            stars.push(<Star key={`empty-${stars.length}`} fill="gray" strokeWidth={0} size={20} className="me-1" />);
        }

        return stars;
    };

    return (
        <div className="container my-4">
            {Object.keys(products).map(category => (
                <div key={category} className="mb-5">
                    <h3 className="mb-3 text-black product-category-title fw-bold">{category}</h3>
                    <div className="row">
                        {products[category].map(product => (
                            <div key={product._id} className="col-md-4 mb-4 ">
                                <div className="card h-100 shadow-sm  bg-white  text-black card-container">
                                    {product.image?.[0]?.url && (
                                        <img
                                            src={product.image[0].url}
                                            className="card-img-top"
                                            alt={product.name}
                                            style={{ height: '200px', objectFit: 'cover' }}
                                        />
                                    )}
                                    <div className="card-body d-flex flex-column">
                                        <h5 className="card-title fs-4">{product.name}</h5>

                                        <p className="card-text text-truncate" title={product.description}>
                                            {product.description}
                                        </p>

                                        <div className="d-flex align-items-center mb-3">
                                            {renderStars(product.ratings)}
                                            <span className="badge bg-light text-primary fw-bold ms-2">
                                                {product.ratings?.toFixed(1) || "0.0"}
                                            </span>
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center mt-auto">
                                            <h2 className="mb-0 card-title product-price fw-bold fs-3">₹ {product.price}</h2>
                                            <button className="btn btn-primary fw-bold">Buy Now</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductList;
```

### ShoppingCart.jsx
```
import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../pages/ShoppingCart.css';
import { useCartStore, useAuthStore } from "../store/authStore";

const ShoppingCart = () => {
    const {
        cartItems,
        fetchCartItems,
        updateQuantity,
        removeItem,
        loading,
        error,
    } = useCartStore();
    const { isAuthenticated } = useAuthStore()
    console.log(isAuthenticated);

    const navigate = useNavigate()
    const location = useLocation();
    useEffect(() => {
        fetchCartItems();
    }, []);

    const handleIncreaseQuantity = (productId, currentQuantity) => {
        updateQuantity(productId, currentQuantity + 1);
    };

    const handleDecreaseQuantity = (productId, currentQuantity) => {
        if (currentQuantity > 1) {
            updateQuantity(productId, currentQuantity - 1);
        }
    };

    const handleRemoveItem = (productId) => {
        removeItem(productId);
    };

    const handleCheckout = () => {
        if (!isAuthenticated) {
            navigate("/login", { state: { from: location } }); 
        } else {
            navigate("/order", {
                state: {
                    cartItems,
                    totalAmount: total,
                },
            });
        }
    };
    const originalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const savings = cartItems.length > 0 ? 299 : 0;
    const storePickup = cartItems.length > 0 ? 99 : 0;
    const tax = cartItems.length > 0 ? 799 : 0;
    const total = originalPrice - savings + storePickup + tax;

    return (
        <div className="cart-page ">
            <div className="cart-items ">
                <h2 className="cart-items-heading">Your Cart</h2>
                <div className="cart-table">
                    <div className="cart-table-header">
                        <div className="header-product">Product</div>
                        <div className="header-quantity">Quantity</div>
                        <div className="header-total-item item-total-heading">Item Total</div>
                        <div className="header-action item-total-heading">Actions</div>
                    </div>

                    {loading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : cartItems.length === 0 ? (
                        <p className="text-black">Your cart is empty.</p>
                    ) : (
                        cartItems.map((item) => {
                            const numericQuantity = item.quantity;

                            return (
                                <div className="cart-item" key={item._id}>
                                    <div className="item-info">
                                        <img
                                            src={item.image[0]?.url || ""}
                                            alt={item.name}
                                            className="item-image"
                                        />
                                        <div className="item-details">
                                            <h3 className="item-name">{item.name}</h3>
                                            <p className="item-price">
                                                <strong>Price:</strong> ₹{item.price}
                                            </p>
                                            <p className="item-quantity">
                                                <strong>Quantity:</strong> {numericQuantity}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="quantity-control">
                                        <button
                                            className="quantity-button decrease-btn"
                                            onClick={() => handleDecreaseQuantity(item._id, numericQuantity)}
                                            disabled={numericQuantity <= 1}
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            value={numericQuantity}
                                            className="quantity-input"
                                            readOnly
                                        />
                                        <button
                                            className="quantity-button increase-btn"
                                            onClick={() => handleIncreaseQuantity(item._id, numericQuantity)}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div className="item-total">
                                        <span className="item-total-price">
                                            ₹{item.price * numericQuantity}
                                        </span>
                                    </div>

                                    <div className="item-actions">
                                        <button
                                            className="remove-item-btn"
                                            onClick={() => handleRemoveItem(item._id)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="price-summary ">
                <h3 className="price-summary-heading">Price summary</h3>
                <div className="summary-item">
                    <p className="summary-label">Subtotal:</p>
                    <p className="summary-value">₹{originalPrice}</p>
                </div>
                <div className="summary-item">
                    <p className="summary-label">Savings:</p>
                    <p className="summary-value">-₹{savings}</p>
                </div>
                <div className="summary-item">
                    <p className="summary-label">Shipping Charges:</p>
                    <p className="summary-value">₹{storePickup}</p>
                </div>
                <div className="summary-item">
                    <p className="summary-label">Tax:</p>
                    <p className="summary-value">₹{tax}</p>
                </div>
                <div className="summary-total">
                    <p className="total-label">Total:</p>
                    <p className="total-value">₹{total}</p>
                </div>

                <button className="checkout-btn" onClick={handleCheckout}>
                    Proceed to Checkout
                </button>
            </div>
        </div>
    );
};

export default ShoppingCart;
```
### OrderPage.jsx
```
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import './OrderPage.css';

const OrderPage = () => {
    const { state } = useLocation();
    const { cartItems, totalAmount } = state || {};
    const [paymentMode, setPaymentMode] = useState("cashOnDelivery");
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        zip: "",
        email: "",
        phone: "",
    });

    const navigate = useNavigate(); // Initialize navigate function for redirection

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (paymentMode === "cashOnDelivery") {
            const orderData = {
                customerDetails: formData,
                cartItems,
                totalAmount,
                paymentMode,
            };

            try {
                const response = await fetch("http://localhost:5000/api/order", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(orderData),
                });

                const result = await response.json();
                if (response.ok) {
                    alert("Order placed successfully!");
                    localStorage.removeItem("emailSent");
                    navigate("/orderplaced", {
                        state: {
                            customerDetails: formData,
                            cartItems,
                            totalAmount,
                        }
                    });
                } else {
                    alert("Error placing order: " + result.message);
                }
            } catch (err) {
                console.error("Error:", err);
                alert("Something went wrong!");
            }
        } else {
            localStorage.removeItem("emailSent");
            navigate("/completepayment", {
                state: {
                    customerDetails: formData,
                    cartItems,
                    totalAmount,
                }
            });
        }
    };

    return (
        <div className="orderbody">
            <div className="order-page">
                <div className="delivery-form">
                    <h2>Delivery Details</h2>

                    <form onSubmit={handleSubmit}>

                        <label htmlFor="name">Customer's name : </label>
                        <input type="text" name="name" placeholder="Enter Receiver's Name" required onChange={handleChange} />

                        <label htmlFor="addresstotal">Delivery Address : </label>
                        <div className="deladdress" id="addresstotal">
                            <input type="text" name="address" placeholder="Address" id="addressfeild" required onChange={handleChange} />
                            <input type="text" name="zip" placeholder="Pin Code" required onChange={handleChange} />
                        </div>

                        <input type="email" name="email" placeholder="Email" required onChange={handleChange} />

                        <input type="tel" name="phone" placeholder="Phone Number" required onChange={handleChange} />

                        <label>Payment Method</label>
                        <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                            <option value="cashOnDelivery">Cash on Delivery</option>
                            <option value="online">Online Payment</option>
                        </select>
                        <button type="submit" id="ordersubmit">Place Order</button>
                    </form>
                </div>

                <div className="order-summary">
                    <h3>Order Summary</h3>
                    <ul>
                        {cartItems?.map((item) => (
                            <li key={item._id || item.product._id}>{item.name}</li>
                        ))}
                    </ul>
                    <p>
                        <strong>Total: ₹{totalAmount}</strong>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrderPage;
```
### PaymentForm.jsx
```
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const PaymentForm = () => {
    const { state } = useLocation();
    const { customerDetails, cartItems, totalAmount } = state || {};

    useEffect(() => {
        const sendConfirmationEmail = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/sendconfirmationemail", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        to: customerDetails.email,
                        name: customerDetails.name,
                        items: cartItems,
                        total: totalAmount,
                        address: customerDetails.address,
                        zip: customerDetails.zip,
                        email: customerDetails.email,
                        phone: customerDetails.phone
                    }),

                });

                const result = await response.json();
                if (response.ok) {
                    console.log("Email sent successfully!");
                } else {
                    console.error("Failed to send email:", result.message);
                }
            } catch (error) {
                console.error("Error sending email:", error);
            }
        };

        if (customerDetails && cartItems) {
            sendConfirmationEmail();
        }
    }, [customerDetails, cartItems, totalAmount]);

    const navigate = useNavigate();

    useEffect(() => {
        if (!totalAmount) {
            navigate("/order"); // If totalAmount is missing, redirect to the order page
        } else {
            initiatePayment(); // Initiate Razorpay payment as soon as the page loads
        }
    }, [totalAmount, navigate]);

    const initiatePayment = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ price: totalAmount }),
            });

            const data = await response.json();

            if (response.ok) {
                const options = {
                    key: "rzp_test_sIWGak0qwRvULV",
                    amount: data.amount,
                    currency: "INR",
                    name: "Your Store Name",
                    order_id: data.id,
                    description: "Test Payment",
                    handler: function (response) {
                        alert("Payment Successful!");
                        navigate("/orderplaced");
                    },
                    prefill: {
                        name: "Customer Name",
                    },
                    notes: {
                        address: "Razorpay Test Store",
                    },
                    theme: {
                        color: "#F37254",
                    },
                };
                const rzp1 = new Razorpay(options);
                rzp1.open();
            } else {
                alert("Failed to create order");
            }
        } catch (err) {
            console.error("Error:", err);
            alert("Payment failed!");
        }
    };

    return (
        <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', display: 'flex',
            justifyContent: 'center', alignContent: 'center', alignItems: 'center', flexDirection: 'column'
        }}>
            <div class="spinner-border" role="status">
            </div>

            <div>
                <p>Please Wait</p>
            </div>
            <div>
                <h3>Redirecting to Razorpay Gateway</h3>
            </div>
        </div>
    );
};

export default PaymentForm;
```
### Placed.jsx
```
import { useLocation } from "react-router-dom";
import React, { useEffect, useRef } from "react";
import html2pdf from "html2pdf.js";
import './PlacedSmall.css'
const Placed = () => {
    const { state } = useLocation()
    const { customerDetails, cartItems, totalAmount } = state || {};
    const invoiceRef = useRef();

    useEffect(() => {
        const sendConfirmationEmail = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/sendconfirmationemail", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        to: customerDetails.email,
                        name: customerDetails.name,
                        items: cartItems,
                        total: totalAmount,
                        address: customerDetails.address,
                        zip: customerDetails.zip,
                        email: customerDetails.email,
                        phone: customerDetails.phone
                    }),
                });

                const result = await response.json();
                if (response.ok) {
                    console.log("Email sent successfully!");
                    localStorage.setItem("emailSent", "true");
                } else {
                    console.error("Failed to send email:", result.message);
                }
            } catch (error) {
                console.error("Error sending email:", error);
            }
        };

        // Check if email already sent
        if (customerDetails && cartItems && !localStorage.getItem("emailSent")) {
            sendConfirmationEmail();
        }
    }, [customerDetails, cartItems, totalAmount]);


    const downloadInvoice = () => {
        const element = invoiceRef.current;
        element.style.margin = '0 auto';
        const options = {
            margin: 0.1,
            filename: `ListKaro_Invoice_${customerDetails?.name || "customer"}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
        };
        html2pdf().from(element).set(options).save()
            .then(() => {
                element.style.margin = '';
            });
    };
    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#f0f0f0', }} className="placedcontainer">

                <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', }}>
                    {/* container */}
                    <div style={{ backgroundColor: 'green', maxWidth: '400px', width: '90%', color: 'white', borderRadius: '20px', padding: '20px', textAlign: 'center', }}>

                        <p style={{ fontSize: '28px', fontWeight: '600' }}>
                            Thank You for the Order!
                        </p>

                        <p style={{ fontSize: '18px', fontWeight: '300', marginBottom: '40px', }}>
                            We will deliver it never :)
                        </p>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '10px',
                            }}
                        >
                            <img
                                src="/images/orderplaced.gif"
                                alt="Order Placed"
                                height="100px"
                                width="100px"
                                style={{ borderRadius: '50%', marginBottom: '20px' }}
                            />
                            <span>Order Placed ☑ at {new Date().toLocaleTimeString()}</span>
                            <span>On {new Date().toLocaleDateString()}</span>

                            <a href="/" style={{ textDecoration: 'none', color: "black", fontWeight: '500', backgroundColor: 'white', padding: '7px', borderRadius: '5px' }}>Go to Home</a>

                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#4CAF50', padding: '5px', borderRadius: '8px', }}>
                                <img src="/images/downloadIcon.png" alt="" width={'30px'} />
                                <button onClick={downloadInvoice} style={{
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                }}> Download Invoice</button>
                            </div>

                        </div>
                    </div>
                </div>

                <div
                    ref={invoiceRef}
                    className="invoice"
                    style={{
                        width: '600px',
                        backgroundColor: 'white',
                        padding: '20px',
                        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                        borderRadius: '10px',
                    }}
                >

                    <div className="inheader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div><p style={{ fontWeight: '600', fontSize: '20px' }}>ListKaro <br />Invoice</p> </div>
                        <div style={{ fontSize: '12px', }}>
                            <p>From <b>ListKaro</b> <br /> West Bengal, India <br /> 700001 <br />Invoice Generated on <b>{new Date().toLocaleDateString()}</b> <br /> at {new Date().toLocaleTimeString()}</p>
                        </div>
                    </div>
                    <hr />

                    <div className="inbody">
                        <p>Items <br />
                            {cartItems && cartItems.length > 0 ? (
                                cartItems.map((item, index) => (
                                    <div key={index} style={{ marginBottom: '5px' }}>
                                        {item.name} - Qty: {item.quantity}
                                    </div>
                                ))
                            ) : (
                                <p>No items found.</p>
                            )}</p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>

                            <p>Total bill : {
                                totalAmount ? (
                                    <>
                                        Rs: {totalAmount}/-
                                    </>) : (
                                    <p> 000 </p>
                                )
                            } </p>

                        </div>

                    </div>

                    <hr />

                    <div className="incustomer">
                        <p><u>Billing Details</u></p>
                        {customerDetails ? (
                            <>
                                <p style={{ fontSize: '12px' }} id="p">
                                    Customer : {customerDetails.name} <br />
                                    Delivery Location : {customerDetails.address} <br />
                                    Area Code : {customerDetails.zip} <br />
                                    Phone : {customerDetails.phone} <br />
                                    Email : {customerDetails.email}</p>
                            </>
                        ) : (
                            <p>No Details Found</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Placed;

```
## adminpanel
### Dashboard.jsx
```
import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useProductStore } from "../store/authStore";
import "./Dashboard.css";

export default function Dashboard() {
    const {
        products,
        loading,
        error,
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,
    } = useProductStore();

    const [showModal, setShowModal] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
        quantityValue: "",
        quantityUnit: "",
        images: [],
    });
    const [selectedImages, setSelectedImages] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 5;

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleDelete = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        await deleteProduct(productId);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedImages(files);
    };

    const resetForm = () => {
        setNewProduct({
            name: "",
            description: "",
            price: "",
            category: "",
            stock: "",
            quantityValue: "",
            quantityUnit: "",
            images: [],
        });
        setSelectedImages([]);
        setEditingProductId(null);
        setIsEditing(false);
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("name", newProduct.name);
        formData.append("description", newProduct.description);
        formData.append("price", newProduct.price);
        formData.append("category", newProduct.category);
        formData.append("stock", newProduct.stock);
        formData.append("quantityValue", newProduct.quantityValue);
        formData.append("quantityUnit", newProduct.quantityUnit);

        Array.from(selectedImages).forEach((file) => {
            formData.append("images", file);
        });

        try {
            if (isEditing) {
                await updateProduct(editingProductId, formData);
            } else {
                await createProduct(formData);
            }

            await fetchProducts();
            setShowModal(false);
            resetForm();
        } catch (err) {
            console.error("Upload/Update Error:", err);
        }
    };

    const handleEdit = (product) => {
        setShowModal(true);
        setIsEditing(true);
        setEditingProductId(product?._id);
        setNewProduct({
            name: product?.name || "",
            description: product?.description || "",
            price: product?.price || "",
            category: product?.category || "",
            stock: product?.stock || "",
            quantityValue: product?.quantity?.value || "",
            quantityUnit: product?.quantity?.unit || "",
            images: product?.image || [],
        });
        setSelectedImages([]); // Will reselect new files if needed
    };

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = Array.isArray(products)
        ? products.slice(indexOfFirstProduct, indexOfLastProduct)
        : [];

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="adminContainer">
            <nav className="navbar adminnav">
                <div className="container">
                    <button
                        className="btn btn-outline-light"
                        type="button"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#offcanvasAdmin"
                        aria-controls="offcanvasAdmin"
                    >
                        ☰
                    </button>
                    <h3 className="navbar-brand">ListKaro</h3>
                    <p>Admin Panel</p>
                </div>
            </nav>

            <div
                className="offcanvas adminoffcanvas offcanvas-start"
                tabIndex="-1"
                id="offcanvasAdmin"
                aria-labelledby="offcanvasAdminLabel"
            >
                <div className="offcanvas-header">
                    <h5 id="offcanvasAdminLabel">ListKaro Admin Panel</h5>
                    <button
                        type="button"
                        className="btn-close text-reset"
                        data-bs-dismiss="offcanvas"
                        aria-label="Close"
                    ></button>
                </div>
                <div className="offcanvas-body">
                    <ul className="navbar-nav">
                        <li className="nav-item"><a href="/adminpanel" className="nav-link">Dashboard</a></li>
                        <li className="nav-item"><a href="/allproducts" className="nav-link">All Products</a></li>
                        <li className="nav-item"><a href="/" className="nav-link">Go to Home Page</a></li>
                    </ul>
                </div>
            </div>

            <div className="container mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>All Products</h2>
                    <Button onClick={() => { setShowModal(true); resetForm(); }}>
                        + Upload Product
                    </Button>
                </div>

                {error && <p className="text-danger">{error}</p>}

                {loading ? (
                    <div className="d-flex justify-content-center align-items-center">
                        <Spinner animation="border" variant="primary" />
                        <span className="ms-2">Loading products...</span>
                    </div>
                ) : currentProducts.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Images</th>
                                    <th>Quantity</th>
                                    <th>Update</th>
                                    <th>Remove</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentProducts.map((product, index) => (
                                    <tr key={product._id || index}>
                                        <td>{product?.name}</td>
                                        <td>{product?.category}</td>
                                        <td>₹{product?.price}</td>
                                        <td>
                                            {Array.isArray(product.image) && product.image.map((img, i) => (
                                                <img
                                                    key={i}
                                                    src={img?.url}
                                                    alt={product.name}
                                                    style={{ width: "50px", height: "50px", marginRight: "5px" }}
                                                />
                                            ))}
                                        </td>
                                        <td>{product?.quantity ? `${product.quantity.value} ${product.quantity.unit}` : "N/A"}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => handleEdit(product)}
                                            >
                                                Edit
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDelete(product._id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <nav>
                            <ul className="pagination justify-content-center">
                                {[...Array(Math.ceil(products.length / productsPerPage)).keys()].map((number) => (
                                    <li key={number} className="page-item">
                                        <button onClick={() => paginate(number + 1)} className="page-link">
                                            {number + 1}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                ) : (
                    <p>No products available.</p>
                )}
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? "Update Product" : "Add Product"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleUpload} encType="multipart/form-data">
                        <Form.Group>
                            <Form.Label>Name</Form.Label>
                            <Form.Control name="name" value={newProduct.name} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Description</Form.Label>
                            <Form.Control name="description" value={newProduct.description} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Price</Form.Label>
                            <Form.Control name="price" value={newProduct.price} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Category</Form.Label>
                            <Form.Control name="category" value={newProduct.category} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Stock</Form.Label>
                            <Form.Control name="stock" value={newProduct.stock} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Quantity Value</Form.Label>
                            <Form.Control name="quantityValue" value={newProduct.quantityValue} onChange={handleInputChange} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Quantity Unit</Form.Label>
                            <Form.Select
                                name="quantityUnit"
                                value={newProduct.quantityUnit}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Unit</option>
                                <option value="kg">kg</option>
                                <option value="g">g</option>
                                <option value="litre">litre</option>
                                <option value="ml">ml</option>
                                <option value="pcs">pcs</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Images</Form.Label>
                            <Form.Control type="file" multiple onChange={handleImageChange} />
                        </Form.Group>
                        {isEditing && newProduct.images?.length > 0 && (
                            <div className="mt-2">
                                <p>Existing Images:</p>
                                {newProduct.images.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img?.url}
                                        alt={`product-${idx}`}
                                        style={{ width: 50, height: 50, marginRight: 5 }}
                                    />
                                ))}
                            </div>
                        )}
                        <Button variant="primary" type="submit" className="mt-3">
                            {isEditing ? "Update Product" : "Add Product"}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
}
```
## store
### authStore.js
```
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/auth"
    : "/api/auth";

axios.defaults.withCredentials = true;

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            error: null,
            isLoading: false,
            isCheckingAuth: true,
            message: null,

            signup: async (email, password, name) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.post(`${API_URL}/signup`, {
                        email,
                        password,
                        name,
                    });
                    set({ user: response.data.user, isAuthenticated: true, isLoading: false });
                    console.log("Sign up successful", response.data);
                } catch (error) {
                    set({
                        error: error.response?.data?.message || "Error signing up",
                        isLoading: false,
                    });
                    throw error;
                }
            },

            login: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.post(`${API_URL}/login`, {
                        email,
                        password,
                    });

                    localStorage.setItem("token", response.data.jwt); // optional if you use Authorization headers

                    set({
                        isAuthenticated: true,
                        user: {
                            ...response.data.user,
                            isVerified: response.data.user.isVarified,
                        },
                        error: null,
                        isLoading: false,
                    });

                    console.log("Login successful", response.data);
                } catch (error) {
                    set({
                        error: error.response?.data?.message || "Error logging in",
                        isLoading: false,
                    });
                    throw error;
                }
            },

            logout: async () => {
                set({ isLoading: true, error: null });
                try {
                    await axios.post(`${API_URL}/logout`);
                } catch (error) {
                    console.error("Logout error:", error);
                } finally {
                    localStorage.removeItem("token");
                    set({
                        user: null,
                        isAuthenticated: false,
                        error: null,
                        isLoading: false,
                    });
                }
            },

            verifyEmail: async (code) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.post(`${API_URL}/verify-email`, { code });
                    set({
                        user: response.data.user,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                    console.log(response.data);
                    return response.data;
                } catch (error) {
                    set({
                        error: error.response?.data?.message || "Error verifying email",
                        isLoading: false,
                    });
                    throw error;
                }
            },

            checkAuth: async () => {
                set({ isCheckingAuth: true, error: null });
                try {
                    const response = await axios.get(`${API_URL}/check-auth`);
                    const user = response.data.user;
                    set({
                        user: {
                            ...user,
                            isVerified: user.isVerified ?? user.isVarified,
                        },
                        isAuthenticated: true,
                        isCheckingAuth: false,
                    });
                } catch (error) {
                    set({
                        error: null,
                        isCheckingAuth: false,
                        isAuthenticated: false,
                    });
                }
            },

            forgotPassword: async (email) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.post(`${API_URL}/forgot-password`, { email });
                    set({ message: response.data.message, isLoading: false });
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || "Error sending reset password email",
                    });
                    throw error;
                }
            },

            resetPassword: async (token, password) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.post(`${API_URL}/reset-password/${token}`, { password });
                    set({ message: response.data.message, isLoading: false });
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || "Error resetting password",
                    });
                    throw error;
                }
            },
        }),
        {
            name: "auth-storage", // name in localStorage
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);


const CART_API_URL = import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/cart"
    : "/api/cart";

export const useCartStore = create((set) => ({
    cartItems: [],
    loading: false,
    error: null,

    fetchCartItems: async () => {
        set({ loading: true, error: null });
        try {
            const response = await axios.get(`${CART_API_URL}/user-cart`, {
                withCredentials: true,
            });
            set({ cartItems: response.data.data, loading: false });
        } catch (error) {
            set({ error: "Failed to load cart items", loading: false });
        }
    },

    updateQuantity: (productId, newQuantity) => {
        set((state) => ({
            cartItems: state.cartItems.map((item) =>
                item._id === productId ? { ...item, quantity: newQuantity } : item
            ),
        }));
    },

    removeItem: async (productId) => {
        try {
            await axios.delete(`${CART_API_URL}/user-cart/${productId}`, {
                withCredentials: true,
            });
            set((state) => ({
                cartItems: state.cartItems.filter((item) => item._id !== productId),
            }));
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    },

    getCartCount: () => {
        const items = useCartStore.getState().cartItems;
        console.log("Cart count:", items.length);
        return items.length;


    }
}));


const PRODUCT_API_URL = import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/products/"
    : "/api/products/";

export const useProductStore = create((set) => ({
    products: [],
    loading: false,
    error: null,
    createProduct: async (formData) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.post(`${PRODUCT_API_URL}createProduct`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            });

            set((state) => ({
                products: [...state.products, response.data.product],
                loading: false,
            }));
            console.log("Product created successfully", response.data);
        } catch (error) {
            set({ error: "Failed to create product", loading: false });
            console.error("Error creating product:", error);
        }
    }
    ,
    fetchProducts: async () => {
        set({ loading: true, error: null })
        try {
            const response = await axios.get(`${PRODUCT_API_URL}getAllProducts`, {
                withCredentials: true,
            })
            set({ products: response.data.data, loading: false })
            console.log("Products fetched successfully", response.data);

        } catch (error) {
            set({ error: "Failed to fetch products", loading: false })
            console.error("Error fetching products:", error);

        }
    },
    updateProduct: async (productId, updatedData) => {
        set({ loading: true, error: null }); // Show loading state

        try {
            const response = await axios.put(
                `${PRODUCT_API_URL}updateProduct/${productId}`,
                updatedData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            // Optionally: update the local state
            set((state) => ({
                products: state.products.map((product) =>
                    product._id === productId ? response.data : product
                ),

            }));
        } catch (error) {
            console.error("Error updating product:", error);
            set({ error: error.message });
        } finally {
            set({ loading: false }); // Hide loading state
        }
    },



    deleteProduct: async (productId) => {
        set({ loading: true, error: null });
        try {
            console.log("Deleting product with ID:", productId);

            await axios.delete(`${PRODUCT_API_URL}deleteProduct/${productId}`, {
                withCredentials: true,
            });

            set((state) => ({
                products: state.products.filter(product => product._id !== productId),
                loading: false
            }));

            console.log("Product deleted successfully");
        } catch (error) {
            set({ error: "Failed to delete product", loading: false });
            console.error("Error deleting product:", error);
        }
    }

}))


const ONE_CLICK_BUY_URL = import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/"
    : "/api/";

export const useBulkUploadStore = create((set) => ({
    bulkUploadProducts: async (products) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.post(`${ONE_CLICK_BUY_URL}bulk-upload`, { products }, {
                withCredentials: true,
            });
            set({ loading: false });
            console.log("Bulk upload successful", response.data);
        } catch (error) {
            set({ error: "Failed to bulk upload products", loading: false });
            console.error("Error during bulk upload:", error);
        }
    },
}));
```
## CSS
### About.css
```
.aboutcontainer ul {
  display: flex;
  justify-content: center;
  align-items: center;
  list-style: none;
  padding: 0;
  margin: 0;
}
.aboutcontainer ul .backToHome{
  text-decoration: none;
}
.aboutcontainer ul li {
  position: relative;
  color: white;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  margin: 8px;
  transition: color 0.3s ease, transform 0.3s ease;
}
/* Smooth hover effect */
.aboutcontainer ul li:hover {
  transform: scale(0.95);
  color: rgba(255, 255, 255, 0.7);
}
.aboutcontainer ul li::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background-color: red;
  transition: width 0.3s ease;
}
.aboutcontainer ul li:hover::after {
  width: 100%;
}
/* Company */
.logocontainer {
    display: flex;
    align-items: center;
    justify-content: center;
}
.logocontainer img{
    height: 80px;
    width: 80px;
}
.companydetails{
    display: flex;
    justify-content: space-around;
    padding: 20px;
    margin: 20px;
    font-size: 20px;
}
.companydetails img{
    border-radius: 10px;
    margin-bottom: 10px;
    transition: all 0.3s ease-in-out;
    height: 500px;
}
.companydetails img:hover{
    transform: scale(0.9);
    transform: rotate(2deg);
    cursor: pointer;
}
/* Developers */
  .jabed{
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    margin: 150px;
  }
  .jabed img{
    border-radius: 30px;
    margin-left: 30px;
  }
  .indadul{
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    margin: 150px;
  }
  .indadul img{
    border-radius: 30px;
    margin-right: 30px;
  }

/* Projects */
.projectcontainer{
    margin: 20px;
    padding: 20px;
    font-size: 20px;
    display: flex;
    justify-content: space-around;
}
.projectcontainer p{
    margin: 40px;
}
.projectcontainer img{
    transition: all 0.3s ease;
}
.projectcontainer img:hover{
    transform: scale(0.97);
    transform: rotate(2deg);
    cursor: pointer;
}
.tech-card-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  padding: 0 40px;
}
.tech-card {
  background-color: white;
  color: black;
  padding: 20px 25px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  font-weight: 600;
  font-size: 16px;
  min-width: 200px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.tech-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
}
```
### AboutDark.css
```
body.dark .aboutcontainer ul a {
    color: #ffffff;
  }
  body.dark .aboutcontainer ul li {
    color: #ffffff;
  }
  body.dark .aboutcontainer ul li:hover {
    color: rgba(255, 255, 255, 0.5);
  }
  body.dark .companydetails {
    color: #e0e0e0;
  }
  body.dark .projectcontainer {
    color: #dddddd;
  }
```
### AboutSmall.css
```
@media (max-width:480px) {
  .nav-holder { padding: 0; margin: 0 }
  .my-navbar {
    margin: 0;
    padding: 0;
    padding-top: 0px;
    margin-bottom: 0px;
  }
  .aboutcontainer {
    padding: 0px;
    margin: 0px;
    max-width: 480px;
  }
  .aboutcontainer ul { margin: 10px; padding: 5px }
  .aboutcontainer ul li { color: #5656c4; font-size: 12px }
  .aboutcontainer ul li:hover {
    color: #3333cc;
    font-size: 12px;
    font-weight: bold;
  }
  .aboutcontainer img { height: 25px; width: 25px }

  .logocontainer {
    max-width: 480px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
  }
  .logocontainer img { height: 40px; width: 40px }

  .companydetails {
    flex-direction: column;
    padding: 10px;
    margin: 10px;
    font-size: 40px;
    max-width: 480px;
    max-height: 480px;
  }
  .companydetails p { color: #1a1a1a }
  .companydetails img {
    border-radius: 10px;
    margin-bottom: 10px;
    transition: all 0.3s ease-in-out;
    width: 400px;
    height: 400px;
  }
  /* Developers */
  .jabed {
    justify-content: space-between;
    flex-direction: column;
    margin: 20px;
  }

  .jabed img {
    border-radius: 30px;
    margin-left: 0px;
    height: 200px;
    width: 800px;
  }

  .indadul {
    justify-content: space-between;
    flex-direction: column;
    margin: 20px;
  }

  .indadul img {
    border-radius: 30px;
    margin-right: 0px;
    height: 200px;
    width: 800px;
    margin-bottom: 15px;
  }

  /* Projects */
  .projectcontainer {
    margin: 0px;
    padding: 0px;
    display: flex;
    justify-content: space-around;
    flex-direction: column;
  }
  .projectcontainer p { margin: 20px; font-size: 14px }

  .projectcontainer img { padding: 20px; transition: all 0.3s ease }

  .projectcontainer img:hover {
    transform: scale(0.97);
    transform: rotate(2deg);
    cursor: pointer;
  }
}
```
### FAQ.css
```
/* Root styles for light theme */
body {
  background-color: #f8f9fa;
  color: #212529;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* FAQ Container */
.faqcontainer {
  max-width: 800px;
  margin: 60px auto;
  padding: 40px;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  text-align: center;
}

/* Header and tagline */
.faqcontainer h3 { font-size: 2.2rem; color: #333; margin-bottom: 10px }

.faqcontainer p {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 30px;
}

/* FAQ Items */
.faqitem { margin-bottom: 20px; text-align: left }

/* Question Button */
.faq-question {
  width: 100%;
  background-color: #f1f3f5;
  color: #333;
  padding: 15px 20px;
  font-size: 1.05rem;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  text-align: left;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.03);
}

.faq-question:hover { background-color: #e9ecef; transform: scale(1.01) }

/* Answer section */
.faqanswer {
  background-color: #f8f9fa;
  margin-top: 10px;
  padding: 15px 20px;
  border-radius: 10px;
  color: #555;
  border-left: 4px solid #339af0;
  animation: fadeIn 0.4s ease-in-out;
}
/* Smooth fade-in */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px) }

  to { opacity: 1; transform: translateY(0) }
}
```
### Home.css
```
@import url('https://fonts.googleapis.com/css2?family=Titillium+Web:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700&display=swap');

body {
	background-color: #F7AD45;
	font-family: "Titillium Web", sans-serif;
	font-weight: 200;
	font-style: normal;
}

/* MIDSECTION  */
.carocontainer {
	display: flex;
	align-items: flex-start;
	justify-content: center;
	gap: 2rem;
	width: 100%;
	height: auto;
	flex-wrap: wrap;
	margin-right: 20px;
	background-color: #BB3E00;
	padding: 20px 0px;
}

.slide-wrapper {
	flex: 1;
	margin-left: 20px;
	max-width: 50rem;
}

.no-underline { text-decoration: none }

.no-underline:hover { color: white }

.slider {
	display: flex;
	width: 100%;
	height: 500px;
	aspect-ratio: unset;
	overflow-x: auto;
	scroll-snap-type: x mandatory;
	scroll-behavior: smooth;
	border-radius: 0.5rem;
	scrollbar-width: none;
	-ms-overflow-style: none;
}
.slider::-webkit-scrollbar { display: none }

.slider img { flex: 1 0 100%; scroll-snap-align: start; object-fit: cover }

.slider-nav {
	display: flex;
	column-gap: 1rem;
	position: absolute;
	left: 30%;
	transform: translate(-50%);
	z-index: 1;
	margin-top: 28rem;
}
.slider-nav a {
	height: 0.6rem;
	width: 0.6rem;
	border-radius: 50%;
	background-color: white;
	box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.9);
	opacity: 0.5;
	transition: opacity ease 250ms;
}
.slider-nav a:hover { opacity: 1 }
/* CARDS SECTION  */
.card-container {
	width: 18rem;
	border: 1px solid #ccc;
	border-radius: 12px;
	overflow: hidden;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	background-color: #fff;
	background-color: #F7AD45;
	transition: transform 0.3s ease;
}
.card-image {
	width: 100%;
	height: 180px;
	object-fit: cover;
}
.card-body { padding: 16px }
.card-title {
	font-size: 1.25rem;
	font-weight: 600;
	margin-bottom: 8px;
	color: #8f3000;
}
.card-text {
	font-size: 0.95rem;
	color: #8f3000;
	font-weight: 300;
	margin-bottom: 16px;
}
.my-navbar { background-color: #F7AD45; position: fixed }
.my-navbar .nav-holder .upload-list-lg {
	text-decoration: none;
	color: #BB3E00;
	font-size: 15px;
}
.searchinput { width: 280px; background-color: #cd561be2 }

.searchinput::placeholder { color: rgba(255, 255, 255, 0.478); font-weight: 400 }

.my-brand {
	font-size: 30px;
	color: white;
	transition: all 0.3s ease;
	text-decoration: none;
}
@media (max-width: 375px) {
	.my-brand { display: none }
}

.my-brand:hover { color: #BB3E00 }
.nav-dropdown { background-color: #F7AD45; text-decoration: none; }

.nav-dropdown-link { text-decoration: none }

.nav-uploadList { text-decoration: none }

.nav-mob-screen-dropdown { background-color: white }

.nav-sidebar-close { color: black }

.nav-sidebarheader-text { color: black }

.upload-list { text-decoration: none; font-size: 1.3rem }

.upload-list-lg { text-decoration: none }

.nav-toggle-icon { color: rgb(61, 61, 61) }

.nav-user-icon { color: rgb(61, 61, 61) }

.nav-cart-icon { color: rgb(61, 61, 61) }

.card-button {
	display: inline-block;
	padding: 8px 16px;
	background-color: #c0541ecf;
	color: white;
	font-weight: 500;
	text-decoration: none;
	border-radius: 6px;
	transition: all 0.3s ease;
}

.card-button:hover { background-color: #BB3E00; transform: scale(0.9) }

.ucontainer { background-color: #F7AD45 }

.uname, .uorders, .ulogout {
	background-color: #F7AD45;
	color: white;
	font: 800;
}

.ulogout { color: red; font-weight: 600 }

/* Scrolling Text  */
.offer-banner {
	background-color: #fef9f0;
	background-color: #657C6A;
	border-top: 2px solid #657C6A;
	border-bottom: 2px solid #657C6A;
	overflow: hidden;
	white-space: nowrap;
	padding: 10px 0;
	font-size: 16px;
	color: white;
	font-weight: 600;
	margin-bottom: 20px;
	box-shadow: 0 0 30px #00ff37c1;
}

.offer-text {
	display: inline-block;
	padding-left: 100%;
	animation: scrollLeft 30s linear infinite;
}

.offer-text span { margin-right: 500px }

@keyframes scrollLeft {
	0% { transform: translateX(0%) }

	100% { transform: translateX(-100%) }
}

.signupcontainer {
	position: fixed;
	top: 55%;
	left: 50%;
	transform: translate(-50%, -50%);
	display: flex;
	flex-direction: column;
	height: auto;
	/* remove fixed height */
	width: 90%;
	max-width: 500px;
	height: auto;
	/* remove fixed height */
	width: 90%;
	max-width: 500px;
	background-color: #ffffff;
	border-radius: 10px;
	box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
	padding: 30px;
	z-index: 10;
	max-height: 85vh;
}

/* Ensure small screens don’t get squished */
@media (max-width: 480px) {
	.signupcontainer {
 padding: 20px; }

	.signheader .signuptitle {
 font-size: 22px; }

	.signupbtn {
 width: 100%;
 max-width: none; }

	.signupcontainer input {
 font-size: 14px; }
}

.signheader {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	margin-bottom: 30px;
	margin-bottom: 30px;
	align-items: center;
}


.signupcontainer input {
	padding: 7px;
	font-size: 16px;
	border-radius: 5px;
	margin-bottom: 12px;
	width: 100%;
	border: 0.5px solid gray;
}

.signheader .signuptitle { font-size: 26px; font-weight: bold }

.signheader .close {
	font-size: 20px;
	cursor: pointer;
	font-weight: 400;
	transition: all 0.3s ease;
	color: green;
}


.close:hover { color: red }

.signupbtn {
	background-color: blue;
	color: white;
	margin-top: 10px;
	max-width: 100px;
	transition: all 0.3s ease;
	padding: 8px 12px;
	padding: 8px 12px;
}


.signupbtn:hover { transform: scale(0.955); background-color: green }

.categoriestitle {
	padding: 30px 50px;
	background-color: #BB3E00;
	color: white;
	font-size: 32px;
	margin: 0;
}

.categories {
	padding: 30px 50px;
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	background-color: #BB3E00;
	color: white;
}

.categoriestitle hr {
	background-color: #BB3E00;
	color: white;
	border: 2px solid white;
	margin-top: 30px;
	margin-bottom: 0;
}

.circontainer { text-align: center }

.circontainer p {
	margin-top: 20px;
	font-weight: bold;
	font-size: 20px;
}

.cirimage {
	height: 120px;
	width: 120px;
	border-radius: 50%;
	cursor: pointer;
	transition: transform 0.5s ease;
	object-fit: cover;
}

.cirimage:hover { transform: scale(1.1); box-shadow: 0 2px 10px rgba(0, 0, 0, 0.299) }

.offer {
	background-color: orange;
	height: auto;
	margin: 0px 50px;
	border-radius: 30px;
	text-align: start;
	display: flex;
	justify-content: space-around;
}

.offercontainer {
	margin: 50px;
	padding: 20px;
	font-weight: bold;
	color: whitesmoke;
}

.offercontainer h3 { font-size: 40px; font-weight: bold }

.offercontainer p {
	font-size: 18px;
	font-weight: bold;
	color: white;
}

.offercontainer #price {
	font-size: 28px;
	font-weight: bold;
	color: yellow;
}

.offercontainer #star { color: rgba(0, 0, 0, 0.358) }

.offercontainer input {
	width: 120px;
	border-radius: 10px;
	border: none;
	padding: 10px;
	background-color: rgba(0, 0, 255, 0.8);
	color: white;
	font-weight: bold;
	transition: transform 0.3s ease;
}

.offercontainer input:hover { background-color: blue; transform: scale(0.9) }

.newsletter {
	margin: 50px;
	padding: 20px;
	border-radius: 40px;
	font-weight: bold;
	background-color: white;
	display: flex;
	justify-content: space-around;
	align-items: center;
}

.newsletter h3 { font-size: 35px; font-weight: bold }

.newsletter .emailbox {
	width: 250px;
	font-size: 16px;
	border-radius: 10px;
	padding: 10px;
	margin-right: 10px;

}

.newsletter .emailbtn {
	font-size: 16px;
	padding: 10px;
	border-radius: 10px;
	background-color: #ffa600d9;
	border: none;
	color: white;
	font-weight: bold;
	width: 100px;
	transition: transform 0.3s ease;
}

.emailbtn:hover { background-color: #ffa500; transform: scale(0.9) }

footer {
	display: flex;
	justify-content: space-around;
	align-items: flex-start;
	padding: 20px;
	margin: 20px;

}

footer .products, .aboutus, .consumers, .programs { display: flex; flex-direction: column; }

footer p { font-size: 18px; font-weight: bold }

footer a {
	text-decoration: none;
	color: black;
	margin-bottom: 5px;
}

footer a:hover { color: red; font-weight: 300 }

hr { opacity: 0.2 }

/* OfferPopup */
.offerPopupContainer {
	background: linear-gradient(#2144c3, #8797e0);
	height: 280px;
	width: 380px;
	position: fixed;
	z-index: 10;
	bottom: 30px;
	right: 30px;
	border-radius: 30px;
	background-repeat: no-repeat;
	background-size: cover;
	background-position: center;
	overflow: hidden;
	opacity: 0;
	animation: fadeIn 1s forwards;
	box-shadow: 0 0 10px rgba(4, 21, 255, 0.821);
}

@keyframes fadeIn {
	from { opacity: 0; transform: translateY(20px) }

	to { opacity: 1; transform: translateY(0px) }
}

.offerPopupContent {
	color: white;
	font-size: 16px;
	width: 350px;
	padding: 30px;
}

.offerPopupContent h3 {
	font-weight: bold;
	font-size: 30px;
	width: 200px;
}

.offerPopupContent .ccbtn {
	padding: 5px;
	font-weight: 500;
	border: none;
	background-color: #c3ff00;
	color: rgb(67, 67, 67);
	border-radius: 50px;
	box-shadow: 0 0 20px rgba(255, 255, 255, 0.547);
	margin-top: 20px;
	width: 300px;
}

.sunmoonicon {
	height: 30px;
	width: 30px;
	cursor: pointer;
	transition: all 0.3s ease-in;
}

.sunmoonicon:hover { transform: scale(0.9) }
```
### HomeSmall.css
```
@media (min-width: 481px) and (max-width: 768px) {
  body {
 padding: 0;
 margin: 0; }

  .carocontainer {
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      margin: 0;
      padding: 0;
      left: 0;
  }

  .slide-wrapper {
      margin: 0 auto;
      max-width: 500px;
      width: 100%;
      padding: 0;
  }

  .slider {
 height: 300px;
 border-radius: 0.25rem; }

  .slider-nav {
 left: 50%; 
 margin-top: 10rem; }

  .slider-nav a {
 height: 0.5rem;
 width: 0.5rem; }

  .card-container {
      border: 1px solid #ccc;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      background-color: #fff;
      transition: transform 0.3s ease;
      height: 400px;
      width: 100%;
      max-width: 500px;
      margin-top: 20px;
  }

  .card-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
  }

  .card-body {
 padding: 12px; }

  .card-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 8px;
      color: #333;
  }

  .card-text {
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 0;
  }

  .card-button {
      display: inline-block;
      padding: 8px 18px;
      background-color: #007bff;
      color: white;
      font-weight: 500;
      text-decoration: none;
      border-radius: 6px;
      transition: background-color 0.2s ease;
  }

  .card-button:hover {
 background-color: #0056b3; }

  .categories {
      margin: 0px 20px;
      padding: 20px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
  }

  .circontainer p {
      margin-top: 20px;
      font-weight: bold;
      font-size: 18px;
      max-width: 120px;
  }

  .offer {
      background-color: orange;
      height: auto;
      border-radius: 10px;
      text-align: start;
      display: flex;
      justify-content: space-around;
      flex-direction: column;
      margin: 20px;
      padding: 20px;
  }

  .offercontainer {
      font-weight: bold;
      color: whitesmoke;
      margin: 0;
  }

  .offercontainer h3 {
 font-size: 28px;
 font-weight: bold; }

  .offercontainer p {
      font-size: 14px;
      font-weight: bold;
      color: white;
  }

  .offercontainer #price {
      font-size: 22px;
      font-weight: bold;
      color: yellow;
  }

  .newsletter {
      margin: 20px;
      padding: 20px;
      border-radius: 10px;
      font-weight: bold;
      background-color: white;
      display: flex;
      justify-content: space-around;
      align-items: center;
      flex-direction: column;
      gap: 30px;
  }

  .newsletter h3 {
      font-size: 30px;
      font-weight: bold;
      margin-bottom: 15px;
  }

  .newsletter p {
 font-size: 12px; }

  .newsletter .emailbox {
      width: 300px;
      max-width: 350px;
      font-size: 16px;
      border-radius: 10px;
      padding: 10px;
      margin-right: 10px;
      margin-bottom: 20px;
  }

  .newsletter .emailbtn {
      font-size: 16px;
      padding: 10px;
      border-radius: 10px;
      background-color: #ffa600d9;
      border: none;
      color: white;
      font-weight: bold;
      width: 100px;
      transition: transform 0.3s ease;
  }

  .emailbtn:hover {
 background-color: #ffa500;
 transform: scale(0.9); }

  .newsletter img {
      border-radius: 20px;
      width: 100%;
      height: auto;
  }

  footer {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      padding: 10px;
      margin: 10px;
  }

  footer .products,
  footer .aboutus,
  footer .consumers,
  footer .programs {
 display: flex;
 flex-direction: column; }

  footer p {
 font-size: 16px;
 font-weight: bold; }

  footer a {
      text-decoration: none;
      color: black;
      margin-bottom: 5px;
      font-size: 14px;
  }

  .nav-holder .my-brand {
 text-decoration: none;
 color: #ffa600b0; }

  .offerPopupContainer {
      background: linear-gradient(#2144c3, #8797e0);
      height: 200px;
      width: 300px;
      bottom: 30px;
      right: 30px;
      border-radius: 10px;
      opacity: 0;
      animation: fadeIn 1s forwards;
      padding: 5px;
      box-shadow: 0 0 10px rgba(4, 21, 255, 0.821);
  }

  @keyframes fadeIn {
      from {
          opacity: 0;
          transform: translateY(20px);
      }

      to {
          opacity: 1;
          transform: translateY(0px);
      }
  }

  .offerPopupContent {
 font-size: 14px;
 padding: 10px; }

  .offerPopupContent h3 {
 font-size: 22px; }

  .offerPopupContent .ccbtn {
      background-color: #c3ff00;
      color: rgb(67, 67, 67);
      border-radius: 50px;
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.547);
  }

  /* User Container Nav */
  .ucontainer {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      padding: 8px 0;
      margin: 0;
      min-width: 200px;
      max-height: 300px;
      overflow-y: auto;
      gap: 0;
  }

  .uname,
  .uorders,
  .ulogout {
      padding: 8px 16px;
      width: 100%;
      text-align: left;
      color: white;
      font-weight: 600;
      background-color: #007bff2b;
      box-shadow: 0 0 20px #0b35dd76;
      border: 1px solid #007bff0e;
  }

  .ulogout {
 color: red; }

  .menucontainer {
 width: 100%;
 padding: 10px;
 border-radius: 0px; }

  .menucontainer input[type="search"] {
      font-size: 14px;
      padding: 8px;
      margin-bottom: 10px;
  }

  .upload-list,
  .upload-list a {
 font-size: 14px;
 padding: 8px; }

  .menucontainer .pl-6 {
 padding-left: 10px; }

  .menucontainer .space-y-2 > * + * {
 margin-top: 8px; }

  .menucontainer .pl-6 {
      display: flex;
      flex-direction: column;
      margin-left: 100px;
  }
  .signupcontainer {
    margin: 0;
    padding: 20px;
    height: 500px;
    width: 570px;
    background-color: #f1ecec;
  }
  .signupbtn{ margin: 0 auto; }
  .ahac{ margin-top: 20px; font-size: 18px; }
}

@media (max-width: 1024px) {
  body{
 padding: 0;
 margin: 0; }
  .carocontainer {
    align-items: center;
    gap: 1rem;
    margin: 0;
    padding: 10px;
  }

  .slide-wrapper {
 padding: 0; }
    
  .slider {
    height: 360px;
    max-width: 450px;
    border-radius: 12px;
  }

  .slider-nav { left: 25%;  margin-top: 21rem; 
 }

  .slider-nav a { height: 0.5rem;
    width: 0.5rem; }

  .card-container {
      border: 1px solid #ccc;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      background-color: #fff;
      transition: transform 0.3s ease;
      height: 360px;
      max-width: 250px;
    }
    
  .card-image {
      width: 100%;
      height: 160px;
      object-fit: cover;
  }
    
  .card-body {
 padding: 6px; }
    
  .card-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 8px;
      color: #333;
  } 
  .card-text {
      font-size: 0.75rem;
      color: #666;
      margin-bottom: 0; 
  }
  .card-text strong{display: none;}
  .card-button {
      display: inline-block;
      padding: 6px 16px;
      background-color: #007bff;
      color: white;
      font-weight: 500;
      text-decoration: none;
      border-radius: 6px;
      transition: background-color 0.2s ease;
  }
    
  .card-button:hover {
 background-color: #0056b3; }
  .categories{
      margin: 0px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
  }

  .circontainer p{
      margin-top: 20px;
      font-weight: bold;
      font-size: 18px;
      max-width: 120px;
  }
  .offercontainer{
      font-weight: bold;
      color: whitesmoke;
      margin: 0;
  }
  .offercontainer h3{
 font-size: 30px;
 font-weight: bold; }

  .offercontainer #price{
      font-size: 20px;
      font-weight:bold;
      color: yellow;
  }
  .offercontainer #star{
      color: rgba(0, 0, 0, 0.358);
  }
  .offercontainer input{
      width: 120px;
      border-radius: 10px;
      border: none;
      padding: 8px;
      background-color: rgba(0, 0, 255, 0.8);
      color: white;
      font-weight: bold;
      transition: transform 0.3s ease;
  }
  .offercontainer input:hover{
      background-color: blue;
      transform: scale(0.9);
  }
  .newsletter img{
      border-radius: 20px;
      width: 400px;
      height: 430px;
  }
  .offerPopupContainer {
  background: linear-gradient(#2144c3,  #8797e0);
  height: 380px;
  width: 480px;
  border-radius: 10px;
  opacity: 0;
  animation: fadeIn 1s forwards;
  padding:20px;
  box-shadow: 0 0 10px rgba(4, 21, 255, 0.821);
    }
  @keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px);}
  to{opacity: 1; transform: translateY(0px);}
  }
  .offerPopupContent{ font-size: 24px; padding: 10px; }
  .offerPopupContent h3{ font-size: 50px; width: 300px; }
  .offerPopupContent .ccbtn{
  background-color: #c3ff00;
  color: rgb(67, 67, 67);
  border-radius: 50px;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.547);
  margin-top: 20px;
  width: 300px;
}

/* User Container Nav  */
  .ucontainer {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 8px 0; 
  margin: 0;
  min-width: 180px;
  min-height: 100px;
  max-height: 300px;
  overflow-y: auto;
  gap: 0; 
    }

  .uname, .uorders, .ulogout {
  padding: 8px 16px;
  width: 100%; 
  text-align: left;
  color: white;
  font-weight: 600;
  background-color: #007bff2b;
  box-shadow: 0 0 20px #0b35dd76 ;
  border: 1px solid #007bff0e;
  }
  .ulogout{ color: red; }
  .menucontainer {
    width: 100%;
    padding: 10px;
    border-radius: 0px;
  }

  .menucontainer input[type="search"] {
    font-size: 14px;
    padding: 8px;
    margin-bottom: 10px;
  }

  .upload-list, .upload-list a { font-size: 14px; padding: 8px; }

  .menucontainer .pl-6 { padding-left: 10px; }

  .menucontainer .space-y-2 > * + * { margin-top: 8px; }
  .menucontainer .pl-6{
    display: flex;
    flex-direction: column;
    margin-left: 100px;
  }
  .signupcontainer {
    margin: 0;
    padding: 20px;
    height: 500px;
    width: 350px;
    background-color: #f1ecec;
  }
  .signupbtn{ margin: 0 auto; }
  .ahac{ margin-top: 20px; font-size: 18px; }
}

/* SmartPhone */
@media (max-width: 480px) {
  body{
 padding: 0;
 margin: 0; }
  .carocontainer {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin: 0;
    padding: 0;
    left: 0;
  }
  .slide-wrapper {
      margin: 0 auto;
      max-width: 330px;
      width: 100%;
      padding: 0;
  }
  .slider { height: 250px; border-radius: 0.25rem;
  }
  .slider-nav { left: 50%;  margin-top: 16rem; 
 }
  .slider-nav a { height: 0.5rem; width: 0.5rem; }
  .card-container {
      border: 1px solid #ccc;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      background-color: #fff;
      transition: transform 0.3s ease;
      height: 400px;
      max-width: 330px;
      margin-top: 20px;
  }
  .card-image {
      width: 100%;
      height: 180px;
      object-fit: cover;
  }
  .card-body {
 padding: 8px; }
  .card-title {
      font-size: 1.3rem;
      font-weight: 600;
      margin-bottom: 8px;
      color: #333;
  }
  .card-body strong{
 margin: 0; }
  .card-text {
      font-size: 0.75rem;
      color: #666;
      margin-bottom: 0; 
  }
  .card-button {
      display: inline-block;
      padding: 6px 16px;
      background-color: #007bff;
      color: white;
      font-weight: 500;
      text-decoration: none;
      border-radius: 6px;
      transition: background-color 0.2s ease;
  } 
  .card-button:hover {
 background-color: #0056b3; }
  .categories{
      margin: 0px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
  }
  .circontainer p{
      margin-top: 20px;
      font-weight: bold;
      font-size: 18px;
      max-width: 120px;
  }
  .offer{
      background-color: orange;
      height: auto;
      border-radius: 10px;
      text-align: start;
      display: flex;
      justify-content: space-around;
      flex-direction: column;
      margin:20px;
      padding: 20px;
  }
  .offercontainer{
      font-weight: bold;
      color: whitesmoke;
      margin: 0;
  }
  .offercontainer h3{
 font-size: 30px;
 font-weight: bold; }
  .offercontainer p{
      font-size: 14px;
      font-weight: bold;
      color: white;
  }
  .offercontainer #price{
      font-size: 20px;
      font-weight:bold;
      color: yellow;
  }
  .offercontainer #star{
 color: rgba(0, 0, 0, 0.358); }
  .offercontainer input{
      width: 120px;
      border-radius: 10px;
      border: none;
      padding: 10px;
      background-color: rgba(0, 0, 255, 0.8);
      color: white;
      font-weight: bold;
      transition: transform 0.3s ease;
  }
  .offercontainer input:hover{
 background-color: blue;
 transform: scale(0.9); }
  .newsletter{
      margin:20px;
      padding: 20px;
      border-radius: 10px;
      font-weight: bold;
      background-color: white;
      display: flex;
      justify-content: space-around;
      align-items: center;
      flex-direction: column;
      gap: 30px;

  }
  .newsletter h3{
      font-size: 30px;
      font-weight: bold;
      margin-bottom: 15px;
  }
  .newsletter p{
 font-size:12px; }
  .newsletter .emailbox{
      width: 300px;
      max-width: 350px;
      font-size: 16px;
      border-radius: 10px;
      padding: 10px;
      margin-right: 10px;
      margin-bottom: 20px;
    
  }
  .newsletter .emailbtn{
      font-size: 16px;
      padding: 10px;
      border-radius: 10px;
      background-color:#ffa600d9;
      border: none;
      color: white;
      font-weight: bold;
      width: 100px;
      transition: transform 0.3s ease;
  }
  .emailbtn:hover{
      background-color:#ffa500;
      transform: scale(0.9);
  }
  .newsletter img{
      border-radius: 20px;
      width: 100%;
      height: 430px;
  }
  footer {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 30px;
      padding: 10px;
      margin: 10px;
  }
    
  footer .products,
  footer .aboutus,
  footer .consumers,
  footer .programs {
 display: flex;
 flex-direction: column; }
  footer p {
 font-size: 16px;
 font-weight: bold; }
  footer a {
      text-decoration: none;
      color: black;
      margin-bottom: 5px;
      font-size: 14px;
  }
  .nav-holder .my-brand{ text-decoration: none; color:white; }  
  .offerPopupContainer {
  background: linear-gradient(#2144c3,  #8797e0);
  height: 180px;
  width: 260px;
  bottom: 30px;
  right: 30px;
  border-radius: 10px;
  opacity: 0;
  animation: fadeIn 1s forwards;
  padding:5px;
  box-shadow: 0 0 10px rgba(4, 21, 255, 0.821);
  }
  @keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px);}
  to{opacity: 1; transform: translateY(0px);}
  }
  .offerPopupContent{ font-size: 14px; padding: 10px; }
  .offerPopupContent h3{ font-size: 22px; }
  .offerPopupContent .ccbtn{
    background-color: #c3ff00;
    color: rgb(67, 67, 67);
    border-radius: 50px;
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.547);
    margin-top: 20px;
    width: 230px;
  }
/* User Container Nav  */
  .ucontainer {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 8px 0; 
  margin: 0;
  min-width: 180px;
  min-height: 100px;
  max-height: 300px;
  overflow-y: auto;
  gap: 0; 
  }
  .uname, .uorders, .ulogout {
  padding: 8px 16px;
  width: 100%; 
  text-align: left;
  color: white;
  font-weight: 600;
  background-color: #007bff2b;
  box-shadow: 0 0 20px #0b35dd76 ;
  border: 1px solid #007bff0e;
  }
  .ulogout{ color: red; }


  .menucontainer {
    width: 100%;
    padding: 10px;
    border-radius: 0px;
  }

  .menucontainer input[type="search"] {
    font-size: 14px;
    padding: 8px;
    margin-bottom: 10px;
  }

  .upload-list, .upload-list a { font-size: 14px; padding: 8px; }

  .menucontainer .pl-6 { padding-left: 10px; }

  .menucontainer .space-y-2 > * + * { margin-top: 8px; }
  .menucontainer .pl-6{
    display: flex;
    flex-direction: column;
    margin-left: 100px;
  }
  .signupcontainer {
    margin: 0;
    padding: 20px;
    height: 500px;
    width: 350px;
    background-color: #f1ecec;
  }
  .signupbtn{ margin: 0 auto; }
  .ahac{ margin-top: 20px; font-size: 18px; }
}
```
### LoginPage.css
```
/* Full-screen center */
.login-page {
	height: 100vh;
	display: flex;
	justify-content: center;
	align-items: center;
	background: linear-gradient(135deg, #0f5132, #0d1b2a);
	font-family: 'Segoe UI', sans-serif;
}

/* Login card */
.login-card {
	background-color: #101820;
	color: #00ff88;
	padding: 40px;
	border-radius: 12px;
	box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
	width: 320px;
	text-align: center;
}

/* Heading */
.login-card h2 { margin-bottom: 20px; font-size: 24px }

/* Input group */
.logininput-group {
	display: flex;
    flex-wrap: nowrap;
	background-color: #1f2b3a;
	border-radius: 6px;
	padding: 10px;
	margin-bottom: 15px;
}

.logininput-group .input-icon { margin-right: 8px; color: #00ff88 }

.logininput-group input {
	border: none;
	outline: none;
	background: transparent;
	color: #ffffff;
	width: 100%;
	font-size: 16px;
}

/* Forgot password link */
.forgot {
	text-align: right;
	font-size: 16px;
	margin-bottom: 20px;
}

.forgot a { color: #00ff88; text-decoration: none }

/* Login button */
.login-btn {
	width: 100%;
	padding: 12px;
	background: linear-gradient(to right, #00ff88, #00cc66);
	color: #000;
	border: none;
	border-radius: 6px;
	font-weight: bold;
	cursor: pointer;
	transition: background 0.3s;
}

button:hover { background: linear-gradient(to right, #00cc66, #00ff88) }

/* Signup link */
.signup-link { margin-top: 20px; font-size: 16px }

.signup-link a { color: #00ff88; text-decoration: none }
```
### OrderPage.css
```
.orderbody{ background-color: rgba(10, 10, 25, 0.95); color: white }
.order-page {
    min-width: 700px;  
    display: flex;
    justify-content: space-around;
    align-items: flex-start;
    padding: 30px;
    flex-wrap: wrap;
    gap: 25px;
    background-color: rgba(10, 10, 25, 0.95);
    border-radius: 20px;
    margin: 0px auto; 
    max-width: 1100px;
    box-shadow: 0 0 30px rgba(150, 150, 255, 0.1);  
  }

  .delivery-form {
    flex: 1;
    min-width: 300px;
    max-width: 450px;
    background-color: rgba(30, 30, 60, 0.8);
    padding: 25px;
    border-radius: 20px;
    box-shadow: 0 0 15px rgba(100, 100, 255, 0.2);
  }
  
  .delivery-form h2 {
 text-align: center;
 color: #a3a3ff;
 margin-bottom: 20px; }
  
  .delivery-form form {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 10px;
  }
  
  .delivery-form form input,
  .delivery-form form select {
    padding: 12px;
    border-radius: 15px;
    border: 1px solid #333;
    background-color: #1f1f3f;
    color: white;
    font-size: 15px;
  }
  
  .delivery-form form input:focus,
  .delivery-form form select:focus {
    outline: none;
    border-color: #7f5af0;
    box-shadow: 0 0 10px #7f5af0;
    background-color: #2a2a4a;
  }
  
  .delivery-form form #ordersubmit {
    background-color: #7f5af0;
    color: white;
    padding: 12px;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    cursor: pointer;
    box-shadow: 0 0 10px #7f5af0;
    transition: all 0.3s ease;
  }
  
  #ordersubmit:hover{
 background-color: #7f5af090; }
  
  .deladdress {
 display: flex;
 gap: 10px;
 flex-wrap: wrap; }
  #addressfeild{ width: 100%; height: auto;}

  .order-summary {
    flex: 1;
    min-width: 250px;
    max-width: 400px;
    background-color: rgba(40, 40, 70, 0.85);
    padding: 25px;
    border-radius: 20px;
    box-shadow: 0 0 15px rgba(200, 200, 255, 0.15);
  }
  
  .order-summary h3 {
 text-align: center;
 color: #f0f0ff;
 margin-bottom: 20px; }
  
  .order-summary ul {
    list-style: none;
    padding: 0;
    margin-bottom: 20px;
  }
  
  .order-summary ul li {
 padding: 8px 0;
 border-bottom: 1px solid #444;
 color: #ddd; }
  
  .order-summary p {
    text-align: center;
    font-size: 18px;
    font-weight: bold;
    color: #fff;
  }
```
### PlacedSmall.css
```
@media (max-width:480px){
    .placedcontainer{
        display: flex;
        flex-direction: column;
        padding: 0;
        margin: 0;
    }
    .invoice{
        color: #000000;
        max-width: 350px;
        margin: 0 auto;
        margin-bottom: 20px;
    }
    .inheader h3, p{
        font-size: 10px;
    }
    .inbody{
        font-size: 10px;
    }
    .incustomer #p{
        font-size: 10px;
    }
}
```
### ShoppingCart.css
```
.cart-page {
    max-width: 1440px;
    margin: 2rem auto;
    padding: 3rem 1rem;
    display: grid;
    
    grid-template-columns: 1fr 350px;
    gap: 2rem;
  }
  .empty-cart-container {
    display: flex;
    flex-direction: column; 
    align-items: center;
    justify-content: center; 
    height: 70vh; 
  }
  
  .empty-cart-message {
    font-size: 2rem;
    font-weight: bold;
    color: var(--primary-dark);
    margin-bottom: 20px;  
  }
  
  .viewProducts {
    text-decoration: none; 
    padding: 10px 20px; 
    font-size: 1rem; 
    font-weight: bold; 
    color: var(--text-primary);
    background-color: var(--bg-secondary); 
    border: none;
    border-radius: 5px; 
    transition: background-color 0.3s ease; 
  }
  
  .viewProducts:hover {
background-color: var(--primary-dark); }
  .cart-items {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    padding: 1.5rem;
    min-height: 60vh;
  }

  body.dark .cart-items { background-color: #1a1a1a; }
  body.dark .cart-items-heading {color: white; }
  body.dark .cart-table-header {color: black;}
  body.dark .item-name {color: white;}

  .cart-items-heading {
    font-size: 1.5rem;
    color: #1a1a1a;
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #f0f0f0;
  }
  
  .cart-table {
    width: 100%;
  }
  
  .cart-table-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 0.8fr;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 1rem;
    font-weight: 600;
    color: #4a4a4a;
  }
  
  .cart-item {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 0.8fr;
    align-items: center;
    padding: 1.5rem 1rem;
    border-bottom: 1px solid #f0f0f0;
    gap: 1rem;
  }
  
  .item-info {
    display: flex;
    gap: 1.5rem;
    align-items: center;
  }
  
  .item-image {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
  }
  
  .item-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .item-name {
    font-size: 1rem;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
  }
  
  .item-price {
    color: #666;
    font-size: 0.9rem;
    margin: 0;
  }
  .item-quantity{
    color: #666;
    font-size: 0.9rem;
    margin: 0;
  }
  
  .quantity-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .quantity-button {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
    background: #fff;
    color: #666;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .quantity-button:hover {
color:var(--text-primary)}
  
  .quantity-input {
    width: 50px;
    height: 32px;
    text-align: center;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    color: #666;
  }
  
  .item-total {
font-weight: 600;
color: #1a1a1a;}
  
  .item-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .remove-item-btn {
    padding: 0.5rem;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.9rem;
  }
  

  
  .remove-item-btn {
background:gray;
color: var(--bg-primary)}
  
  .update-item-btn:hover,
  .remove-item-btn:hover {
opacity: 0.9;}
  .remove-item-btn:hover{
background:rgb(63, 62, 62);
color: var(--bg-primary)}
  
  .price-summary {
    background: #ffffff;
    border-radius: 12px;
    padding: 1.5rem;
    height: fit-content;
    position: sticky;
    top: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  
  .price-summary-heading {
    font-size: 1.25rem;
    color: #1a1a1a;
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #f0f0f0;
  }

  body.dark .price-summary{ background-color: #1a1a1a;}
  body.dark .price-summary-heading { color: white;}
  body.dark .summary-item { color: white;}
  body.dark .summary-total { color: white;}

  .summary-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
    color: #666;
  }

  
  .summary-total {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 2px solid #f0f0f0;
    font-weight: 600;
    color: #1a1a1a;
    font-size: 1.1rem;
  }

  .checkout-btn {
    width: 100%;
    padding: 1rem;
    margin-top: 1.5rem;
    background: rgb(68, 67, 67);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .checkout-btn:hover { background: gray}

  @media (max-width: 1024px) {

    .cart-page { grid-template-columns: 1fr 300px; gap: 1.5rem }
  }
  
  @media (max-width: 768px) {

    .cart-page {
      grid-template-columns: 1fr;
      margin: 1rem auto;
      gap: 1rem;
    }
    
    .cart-items {
  padding: 1rem;
}
  
    .cart-table-header {
  display: none;
}
    
    .cart-item {
      grid-template-columns: 1fr;
      gap: 1rem;
      padding: 1.5rem;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      margin-bottom: 1rem;
      position: relative;
    }
  
    .item-info {
      display: grid;
      grid-template-columns: 80px 1fr;
      gap: 1rem;
      align-items: start;
      text-align: left;
    }
  
    .item-image {
      width: 80px;
      height: 80px;
      border-radius: 8px;
    }
  
    .item-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
  
    .item-name {
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}
  
    .item-price {
  font-size: 1rem;
  color: #4a4a4a;
}
  
    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      background: #f8f9fa;
      border-radius: 8px;
      justify-content: flex-start;
      margin: 0.5rem 0;
    }
  
    .quantity-button {
      width: 36px;
      height: 36px;
      font-size: 1.2rem;
    }
  
    .quantity-input {
      width: 60px;
      height: 36px;
      font-size: 1rem;
    }
  
    .item-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-top: 1px solid #f0f0f0;
      margin-top: 0.5rem;
    }
  
    .item-total::before {
      content: 'Item Total:';
      font-weight: normal;
      color: #666;

    }
  
    .item-total-price {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1a1a1a;
    }
  
    .item-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }
  
    .update-item-btn,
    .remove-item-btn {
      padding: 0.75rem;
      font-size: 0.95rem;
      width: 100%;
    }
  
    .price-summary {
      border-radius: 12px;
      padding: 1.25rem;
      margin-top: 1rem;
    }
  
    .summary-item { padding: 0.75rem 0 }
  
    .summary-total { margin-top: 1rem; padding-top: 1rem }
  
    .checkout-btn {
      padding: 1rem;
      font-size: 1.1rem;
      margin-top: 1rem;
    }
  }
  
  @media (max-width: 480px) {
    .cart-page { padding: 0.75rem }
  
    .cart-items { padding: 0.75rem }
  
    .cart-item { padding: 1rem }
  
    .item-info { grid-template-columns: 70px 1fr; gap: 0.75rem }
  
    .item-image { width: 70px; height: 70px }
  
    .item-name { font-size: 1rem }
  
    .quantity-controls { padding: 0.4rem; gap: 0.5rem }
  
    .quantity-button {
      width: 32px;
      height: 32px;
      font-size: 1rem;
    }
  
    .quantity-input { width: 50px; height: 32px }
  
    .item-actions { gap: 0.5rem }
  
    .update-item-btn, .remove-item-btn {
      padding: 0.6rem;
      font-size: 0.9rem;
    }
  }
  
  html { scroll-behavior: smooth }
  
  .update-item-btn:disabled, .remove-item-btn:disabled, .checkout-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  .cart-item, .quantity-button, .update-item-btn, .remove-item-btn, .checkout-btn {
    transition: all 0.2s ease-in-out;
  }
```
### UpList.css
```
.list-upload-container{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
    padding: 12px 8px;
}
#uploadtitle{
    color: black;
    font-size: 20px;
    font-weight: 600;
}
.updelbtn{ display: flex; gap:10px }
.upsection{ width: 100% }
```
### UpListDark.css
```
body.dark .list-upload-container {
    background-color: #29294c;
  }
  
  body.dark #uploadtitle {
    color: #ffd369;
  }
  
  body.dark .dragndrop {
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }
  
  body.dark .listform {
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  body.dark .filelabel {
    background-color: #2b2d42;
    color: #ffffff;
  }
  
  body.dark .filesubmit {
    background-color: #5e5eff;
    color: #ffffff;
  }
  
  body.dark .filesubmit:hover {
    background-color: #1414ff;
  }
  
  body.dark .prod input {
    background-color: #2b2d42;
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  body.dark .addprodbtn {
    background-color: rgba(0, 128, 0, 0.67);
    color: #ffffff;
  }
  
  body.dark .addprodbtn:hover {
    background-color: rgba(0, 128, 0, 0.923);
    color: yellow;
  }

  body.dark .imagecontainer img{
    filter: invert(100%);
  }
  body.dark .listform .prod input{

    background-color:#6161e74b;
  }
  body.dark .listform .prod input::placeholder{
    color: rgba(255, 255, 255, 0.692);
  }
  body.dark .listform img{
    filter: invert(100%);
  }
  body.dark .listform img:hover{
    filter: invert(80%)
  }
```
### UpListSmall.css
```
@media (max-width:480px){
    .upsection{
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    .updelbtn{
        display: flex;
        justify-content: space-around;
        align-items: center;
        gap: 10px;
        font-weight: bold;
        background-color: red;
        color: white;
        padding: 6px;
        margin: 10px;
        width: 100%;
    }
    .updelbtn img{
        display: none;
    }
    .upform{
        box-shadow: 0 0 50px rgba(0, 0, 0, 0.153);
        background-color: white;
    }
    .upform input{
        background-color: whitesmoke;
    }
    .uphead{
       margin-top: 150px;
       
    }
}
```