import express from 'express';
import { upload, createProduct, searchProductsByKeyword, getAllProducts, updateProduct, deleteProduct, getSingleProduct } from '../controlers/products.controler.js';
import { verifyToken, roleBasedAccess } from '../middleware/verifyToken.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Route to create a new product
router.post('/createProduct', authenticate, roleBasedAccess('admin'),  upload.array('images'),  createProduct);
  

// Route to get products by keyword
router.get('/searchProductsByKeyword', searchProductsByKeyword);

// Route to get all products
router.get('/getAllProducts', getAllProducts);

// Route to get a single product by ID
router.get('/singleProduct/:id', authenticate, getSingleProduct);

// Route to update a product by ID
router.put('/updateProduct/:id', authenticate, upload.array('images'), updateProduct);


// Route to delete a product by ID
router.delete('/deleteProduct/:id', authenticate, deleteProduct);

export default router;