import express from 'express';
import { createProduct, getProducts, updateProduct, deleteProduct, getSingleProduct, getProductsByCategory } from '../controlers/products.controler.js';
import multer from 'multer';
const router = express.Router();

//NEW 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'productimages/');
    },
    filename: (req, file, cb) => {
        cb(null,file.originalname);
    }
});
//END
const upload = multer({ storage: storage });

// Route to create a new product
router.post("/createProduct", upload.array('image',3), createProduct);

// Route to get all products
router.get('/getAllProducts', getProducts);

// Route to get a single product by ID
router.get('/singleProduct/:id', getSingleProduct);

// Route to update a product by ID
// router.put('/updateProduct/:id', updateProduct);

// Route to delete a product by ID
router.delete('/deleteProduct/:id', deleteProduct);

router.get('/category/:category', getProductsByCategory);

router.put("/updateProduct/:id", upload.array("image", 3), updateProduct); 



export default router;