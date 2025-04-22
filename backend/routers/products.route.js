import express from 'express';
import { createProduct, searchProductsByKeyword, getAllProducts, updateProduct, deleteProduct, getSingleProduct } from '../controlers/products.controler.js';

const router = express.Router();

// Route to create a new product
router.post('/createProduct', createProduct);

// Route to get products by keyword
router.get('/searchProductsByKeyword', searchProductsByKeyword);

// Route to get all products
router.get('/getAllProducts', getAllProducts);

// Route to get a single product by ID
router.get('/singleProduct/:id', getSingleProduct);

// Route to update a product by ID
router.put('/updateProduct/:id', updateProduct);

// Route to delete a product by ID
router.delete('/deleteProduct/:id', deleteProduct);

export default router;