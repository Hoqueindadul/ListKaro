import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./connection/dbConnection.js";
import uploadRoute from "./routers/upload_route.js"; 
import searchProductRoute from "./routers/searchProduct.route.js";
import productsRoute from "./routers/products.route.js"
import ocrRoute from './routers/ocr_route.js';
<<<<<<< HEAD
import userRoute from "./routers/user.route.js";
import errorHandleMiddleware from "./middleware/error.js";
=======
import authRoutes from './routers/auth_routes.js'
import newsletterRoute from "./routers/newsletter_route.js";
import paymentRoute from './routers/payment_route.js'
>>>>>>> 1e83f0efeeb6ba67ed990377dcfb8b55d33c595f

dotenv.config(); 

const app = express();
const port = process.env.PORT || 5000; 
const uri = process.env.MONGO_URI ;

// Connect to Database
connectDB(uri);

// Middleware
app.use(cors());
app.use(express.json()); 

// Routes
app.use("/api", uploadRoute); 
app.use('/api', ocrRoute);
app.use("/api/search", searchProductRoute);
app.use("/api/products", productsRoute)
<<<<<<< HEAD
app.use("/api", userRoute)
app.use(errorHandleMiddleware)


=======
app.use("/api/auth", authRoutes)
app.use('/api', newsletterRoute);
app.use("/api", paymentRoute);
>>>>>>> 1e83f0efeeb6ba67ed990377dcfb8b55d33c595f



// Start Server
app.listen(port, () => {
  console.log(`Server is running on Port No- ${port}`);
});
