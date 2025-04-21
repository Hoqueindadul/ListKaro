import Products from '../models/products.model.js';

// CREATE PRODUCT
export const createProduct = async (req, res) => {
    try {
        const imageData = req.files.map(file => ({
            public_id: file.filename, 
            url: `/productimages/${file.filename}`
        }));

        req.body.image = imageData;

        // Ensure quantityValue and quantityUnit are provided
        if (req.body.quantityValue && req.body.quantityUnit) {
            // Validate quantityValue
            if (isNaN(req.body.quantityValue)) {
                return res.status(400).json({ success: false, message: "Invalid quantity value" });
            }

            req.body.quantity = {
                value: parseFloat(req.body.quantityValue),
                unit: req.body.quantityUnit
            };
        } else {
            // If quantity info is missing, return an error
            return res.status(400).json({ success: false, message: "Quantity value and unit are required" });
        }

        // Create product
        const product = await Products.create(req.body);
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        console.error("Create Product Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to create product" });
    }
};


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
        const product = await Products.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true, // return the updated document
                runValidators: true // enforce schema validation
            }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            const firstError = Object.values(error.errors)[0].message;
            return res.status(400).json({
                success: false,
                message: firstError
            });
        }

        console.error("Update product error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while updating product"
        });
    }
};

            

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

//Product by Category
export const getProductsByCategory = async (req, res) => {
    const { category } = req.params;
    try {
        const products = await Products.find({ category });
        if (!products.length) {
            return res.status(404).json({ success: false, message: "No products found for this category" });
        }
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
