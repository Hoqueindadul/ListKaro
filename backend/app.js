import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./connection/dbConnection.js";
import uploadRoute from "./routers/upload_route.js";
import searchProductRoute from "./routers/searchProduct.route.js";

dotenv.config(); 

const app = express();
const port = process.env.PORT || 5000; 

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); 

// Routes
app.use("/api", uploadRoute);
app.use("/api/search", searchProductRoute);

// Start Server
app.listen(port, () => {
  console.log(`Server is running on Port No- ${port}`);
});
