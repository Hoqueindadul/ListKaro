import express from 'express';
import { upload, createProduct, searchProductsByKeyword, getAllProducts, updateProduct, deleteProduct, getSingleProduct } from '../controlers/products.controler.js';
import { verifyToken, roleBasedAccess } from '../middleware/verifyToken.js';

const router = express.Router();

// Route to create a new product
router.post('/createProduct', verifyToken, roleBasedAccess('admin'),  upload.array('images'),  createProduct);
  

// Route to get products by keyword
router.get('/searchProductsByKeyword', searchProductsByKeyword);

// Route to get all products
router.get('/getAllProducts', verifyToken, getAllProducts);

// Route to get a single product by ID
router.get('/singleProduct/:id', verifyToken, getSingleProduct);

// Route to update a product by ID
router.put('/updateProduct/:id', verifyToken, upload.array('images'), updateProduct);


// Route to delete a product by ID
router.delete('/deleteProduct/:id', verifyToken, deleteProduct);

export default router;