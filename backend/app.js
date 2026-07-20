import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

// --- Your Router Imports ---
import searchProductRoute from "./routers/searchProduct.route.js";
import productsRoute from "./routers/products.route.js";
import ocrRoute from "./routers/ocr_route.js";
import userRoute from "./routers/user.route.js";
import newsletterRoute from "./routers/newsletter_route.js";
import paymentRoute from "./routers/payment_route.js";
import cartRoute from "./routers/cart.route.js";
import orderRoute from "./routers/order.route.js";
import orderEmail from "./nodemailer/orderEmail.js";
import addressRoute from "./routers/address.route.js";
import errorHandleMiddleware from "./middleware/error.js";

import serverlessExpress from "@vendia/serverless-express";

dotenv.config();

const app = express();

// Global MongoDB connection cache
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI, { bufferCommands: false });
    isConnected = true;
    console.log("MongoDB Connected to Edge");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
  }
};

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// CORS Configurations
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.DEPLOYMENT_CLIENT_URL,
].filter(Boolean);

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
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.options("*", cors());

// 🔥 FIXED: Serverless-safe Body and Cookie Parsers (Bypasses iconv-lite bug)
app.use(async (req, res, next) => {
  // 1. Safe JSON Parser
  if (req.headers["content-type"]?.includes("application/json")) {
    try {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        try {
          req.body = body ? JSON.parse(body) : {};
        } catch {
          req.body = {};
        }
        next();
      });
      return;
    } catch {
      /* fallthrough */
    }
  }

  // 2. Safe URL Encoded Parser
  if (
    req.headers["content-type"]?.includes("application/x-www-form-urlencoded")
  ) {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      const params = new URLSearchParams(body);
      req.body = Object.fromEntries(params.entries());
      next();
    });
    return;
  }
  next();
});

// 3. Safe Cookie Parser Middleware
app.use((req, res, next) => {
  req.cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(";").forEach((cookie) => {
      const [parts] = cookie.split("=");
      const name = parts.trim();
      const value = cookie.substring(name.length + 1).trim();
      if (name) req.cookies[name] = decodeURIComponent(value);
    });
  }
  next();
});

// API Routes (Leave exactly as they were)
app.use("/api", ocrRoute);
app.use("/api/cart", cartRoute);
app.use("/api/search", searchProductRoute);
app.use("/api/products", productsRoute);
app.use("/api/auth", userRoute);
app.use("/api", newsletterRoute);
app.use("/api", paymentRoute);
app.use("/api", orderRoute);
app.use("/api", orderEmail);
app.use("/api", addressRoute);

app.use(errorHandleMiddleware);

app.get("/", (req, res) => {
  res.send("API is running on Cloudflare...");
});

// Export wrapping execution loop natively
export default {
  async fetch(request, env, ctx) {
    return serverlessExpress({ app })(request, env, ctx);
  },
};
