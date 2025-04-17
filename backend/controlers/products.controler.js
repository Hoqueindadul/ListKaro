import Products from '../models/products.model.js';

// CREATE PRODUCT
export const createProduct = async (req, res) => {
    try {
        const product = await Products.create(req.body);
        res.status(201).json({ success: true, data: product })
    } catch (error) {
        console.log(error);

    }

}

// GET PRODUCTS
export const getProducts = async (req, res) => {
    try {
        const allProducts = await Products.find();
        if (!allProducts) {
            res.status(404).json({
                success: false,
                message: "No products found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data: allProducts
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            message: "Internal Server Error" 
        });
    }
}

// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
    try {
        const product = await Products.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // it returns the updated data
            runValidators: true // it runs the validators in the model
        })
        if (!product) {
            res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            const firstError = Object.values(error.errors)[0].message; // Get first validation error message
            return res.status(400).json({ message: firstError });
        }
        console.error(error);
    }
}

// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
    try {
        const product = await Products.findByIdAndDelete(req.params.id);
        if (!product) {
            res.status(404).json({
                success:false,
                message: "Product Not Found"
            });
        };
        res.status(200).json({
            success:true,
            message: "Product deleted successfully",
            data: product
        });
    } catch (error) {
        console.log(error);
    }
}
export const getSingleProduct = async (req, res) => {
    try {
        const product = await Products.findById(req.params.id);
        if(!product){
            res.status(404).json({
                success: false,
                message: "Product not found"
            })
        };
        res.status(200).json({
            success: true,
            message: "Product fetched successfully",
            data: product
        })
    } catch (error) {
        console.log(error);
    }
}