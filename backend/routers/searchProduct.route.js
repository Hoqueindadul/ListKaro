import express from "express";
import { searchProduct } from "../controlers/searchProduct.controler.js";

const router = express.Router();

router.get("/searchProducts", searchProduct);

export default router;
