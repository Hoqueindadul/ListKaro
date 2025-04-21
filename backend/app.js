import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from 'path';
import cookieParser from 'cookie-parser';

import connectDB from "./connection/dbConnection.js";
import uploadRoute from "./routers/upload_route.js"; 
import searchProductRoute from "./routers/searchProduct.route.js";
import productsRoute from "./routers/products.route.js"
import ocrRoute from './routers/ocr_route.js';
import userRoute from "./routers/user.route.js";
import errorHandleMiddleware from "./middleware/error.js";
import newsletterRoute from "./routers/newsletter_route.js";
import paymentRoute from './routers/payment_route.js'

dotenv.config(); 

const app = express();
const port = process.env.PORT || 5000; 
const uri = process.env.MONGO_URI ;
const __dirname = path.resolve();


// Allow origins
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// Connect to Database
connectDB(uri);

// Middleware
app.use(express.json()); 
app.use(cookieParser());

// Routes
app.use("/api", uploadRoute); 
app.use('/api', ocrRoute);
app.use("/api/search", searchProductRoute);
app.use("/api/products", productsRoute)
app.use("/api/auth", userRoute)
app.use(errorHandleMiddleware)
app.use('/api', newsletterRoute);
app.use("/api", paymentRoute);



// Start Server
app.listen(port, () => {
  console.log(`Server is running on Port No- ${port}`);
});
