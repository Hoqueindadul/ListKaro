import Products from '../models/products.model.js';
import APIFunctionality from '../utils/apiFunctionality.js';
import HandleError from '../utils/handleError.js';
import handleAsyncError from '../middleware/handleAsyncError.js';

// CREATE PRODUCT
export const createProduct = async (req, res, next) => {
    try {
        const product = await Products.create(req.body);
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
}

// SEARCH PRODUCTS BY KEYWORDS
export const searchProductsByKeyword = handleAsyncError(async (req, res, next) => {
    const resultPerPage = 3; // Number of products per page
    const apiFeatures = new APIFunctionality(Products.find(), req.query).search().filter();

    const filteredQuery = apiFeatures.query.clone();
    const productCount = await filteredQuery.countDocuments();
    const totalpages = Math.ceil(productCount / resultPerPage);
    const page = Number(req.query.page) || 1;
    if(page>totalpages && productCount){
        return next(new HandleError("This page does not exist", 404));
    }
    const allProducts = await apiFeatures.query;

    if (!allProducts || allProducts.length === 0) {
        return next(new HandleError("No products found", 404));
    }

    res.status(200).json({
        success: true,
        totalProduct: allProducts.length,
        message: "Products fetched successfully",
        data: allProducts,
        productCount,
        resultperPage: resultPerPage,
        currentPage: page,
    });
});

// GET ALL PRODUCT
export const getAllProducts = async(req, res, next) => {
    try {
        const products = await Products.find();
        if(!products){
            return next(new HandleError("Products not found", 404));
        }
        res.status(200).json({ 
            success: true,
            message: "Products found successfully.",
            data: products
         })
    } catch (error) {
        console.log(error)
    }
}

// UPDATE PRODUCT
export const updateProduct = async (req, res, next) => {
    try {
        const product = await Products.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // it returns the updated data
            runValidators: true // it runs the validators in the model
        });
        if (!product) {
            return next(new HandleError("Product not found", 404));
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
        next(error);
    }
}

// DELETE PRODUCT
export const deleteProduct = async (req, res, next) => {
    try {
        const product = await Products.findByIdAndDelete(req.params.id);
        if (!product) {
            return next(new HandleError("Product not found", 404));
        }
        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            data: product
        });
    } catch (error) {
        next(error);
    }
}

// GET SINGLE PRODUCT
export const getSingleProduct = async (req, res, next) => {
    try {
        const product = await Products.findById(req.params.id);
        if (!product) {
            return next(new HandleError("Product not found", 404));
        }
        res.status(200).json({
            success: true,
            message: "Product fetched successfully",
            data: product
        });
    } catch (error) {
        next(error);
    }
}