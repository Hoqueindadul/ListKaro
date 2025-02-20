import express from "express";
import dotenv from "dotenv";
import searchProductRoute from "./routers/searchProduct.route.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json()); // Middleware to parse JSON

// Use searchProductRoute for the search API
app.use("/api/search", searchProductRoute);

app.listen(port, () => {
  console.log(`Server is running on Port No- ${port}`);
});
