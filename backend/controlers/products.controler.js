import Product from '../models/products.model.js';
import APIFunctionality from '../utils/apiFunctionality.js';
import HandleError from '../utils/handleError.js';
import handleAsyncError from '../middleware/handleAsyncError.js';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup
const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const createProduct = handleAsyncError(async (req, res) => {
  try {


    // Validate image upload
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    // Validate required fields
    const {
      name,
      description,
      price,
      category,
      stock,
      ["quantity.value"]: quantityValue,
      ["quantity.unit"]: quantityUnit
    } = req.body;

    if (
      !name?.trim() ||
      !description?.trim() ||
      !price ||
      !category?.trim() ||
      !stock ||
      !quantityValue ||
      !quantityUnit?.trim()
    ) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    // Upload images to Cloudinary
    const imageFiles = await Promise.all(
      req.files.map((file) => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: 'image' },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                reject(error);
              } else {
                resolve({ public_id: result.public_id, url: result.secure_url });
              }
            }
          ).end(file.buffer);
        });
      })
    );

    // Create product object
    const productData = {
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      image: imageFiles,
      quantity: {
        value: Number(quantityValue),
        unit: quantityUnit
      },
      user: req.user._id
    };

    const product = await Product.create(productData);

    res.status(201).json({ success: true, product });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
});


// SEARCH PRODUCTS BY KEYWORDS
export const searchProductsByKeyword = handleAsyncError(async (req, res, next) => {

  const apiFeatures = new APIFunctionality(Product.find(), req.query).search().filter();

  const allProducts = await apiFeatures.query;

  if (!allProducts || allProducts.length === 0) {
    return next(new HandleError("No products found", 404));
  }

  res.status(200).json({
    success: true,
    totalProduct: allProducts.length,
    message: "Products fetched successfully",
    data: allProducts
  });
});

// GET ALL PRODUCT
export const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    if (!products) {
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
    const updatedFields = { ...req.body };

    // Reconstruct nested quantity object from flat fields
    if (req.body["quantity.value"] && req.body["quantity.unit"]) {
      updatedFields.quantity = {
        value: req.body["quantity.value"],
        unit: req.body["quantity.unit"]
      };
      delete updatedFields["quantity.value"];
      delete updatedFields["quantity.unit"];
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updatedFields, {
      new: true, // return the updated document
      runValidators: true, // run schema validations
    });

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct
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
    next(error);
  }
};


// DELETE PRODUCT
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
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
    const product = await Product.findById(req.params.id);
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