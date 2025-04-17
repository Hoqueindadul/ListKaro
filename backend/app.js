import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./connection/dbConnection.js";
import uploadRoute from "./routers/upload_route.js"; 
import searchProductRoute from "./routers/searchProduct.route.js";
import productsRoute from "./routers/products.route.js"
import ocrRoute from './routers/ocr_route.js';
import userRoute from "./routers/user.route.js";
import errorHandleMiddleware from "./middleware/error.js";

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
app.use("/api", userRoute)
app.use(errorHandleMiddleware)


const corsOptions = {
  origin: "http://localhost:5173",  
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions)); // Use the custom CORS options





// Start Server
app.listen(port, () => {
  console.log(`Server is running on Port No- ${port}`);
});
