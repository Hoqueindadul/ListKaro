import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from 'cookie-parser';
import path from 'path';

import connectDB from "./connection/dbConnection.js";
<<<<<<< HEAD
=======
import uploadRoute from "./routers/upload_route.js"; 
>>>>>>> 60f21a9 (working on product serach from image list)
import searchProductRoute from "./routers/searchProduct.route.js";
import productsRoute from "./routers/products.route.js"
import ocrRoute from './routers/ocr_route.js';

dotenv.config(); 

const app = express();
const port = process.env.PORT || 5000; 
const uri = process.env.MONGO_URI ;

// Connect to Database
connectDB(uri);

// Middleware
app.use(express.json()); 
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

// Routes
app.use("/api", uploadRoute); 
app.use('/api', ocrRoute);
app.use("/api/search", searchProductRoute);
app.use("/api/products", productsRoute)
app.use(errorHandleMiddleware)
>>>>>>> 1301830 (work in product api)

// Start Server
app.listen(port, () => {
  console.log(`Server is running on Port No- ${port}`);
});
