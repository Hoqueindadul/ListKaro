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
import orderRoute from "./routers/order.route.js"
import orderEmail from "./nodemailer/orderEmail.js";
import errorHandleMiddleware from "./middleware/error.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const __dirname = path.resolve();

// Allowed origins for CORS
const allowedOrigins = [
  process.env.CLIENT_URL,              // http://localhost:5173
  process.env.DEPLOYMENT_CLIENT_URL    // https://list-karo.vercel.app
].filter(Boolean); // remove undefined/null

// console.log("🚀 Allowed origins:", allowedOrigins);

// Log incoming request origins
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log("Incoming request origin:", origin);
  next();
});

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("CORS Blocked Origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight requests (OPTION) — very important for CORS
app.options("*", cors());

// Connect to MongoDB
connectDB(MONGO_URI);

// Middleware
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use("/api", ocrRoute);
app.use("/api/cart", cartRoute);
app.use("/api/search", searchProductRoute);
app.use("/api/products", productsRoute);
app.use("/api/auth", userRoute);
app.use("/api", newsletterRoute);
app.use("/api", paymentRoute);
app.use("/api", orderRoute);
app.use("/api", orderEmail);

// Error handler (always last route middleware)
app.use(errorHandleMiddleware);

// Default route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
