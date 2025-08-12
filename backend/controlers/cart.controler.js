import Cart from "../models/cart.model.js";
import Product from "../models/products.model.js"; // Make sure this path matches your project

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, source = "manual" } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - You are not logged in",
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Not enough stock available",
      });
    }

    // Find the user's cart
    let cart = await Cart.findOne({ userId });

    // If no cart exists, create a new one
    if (!cart) {
      cart = new Cart({
        userId,
        products: [{ productId, quantity, source }],
      });
    } else {
      // Check if product already exists in cart
      const existingProductIndex = cart.products.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (existingProductIndex > -1) {
        // Update quantity
        cart.products[existingProductIndex].quantity += quantity;
      } else {
        // Add new product
        cart.products.push({ productId, quantity, source });
      }
    }

    await cart.save();

    // Populate product details before sending
    const populatedCart = await Cart.findOne({ userId }).populate("products.productId");

    return res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      data: populatedCart.products,
    });

  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const getUserCart = async (req, res) => {
  try {
    // Ensure the user is authenticated
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - user not logged in",
      });
    }

    // Find the user's cart and populate product details (productId is the reference in cart)
    const cart = await Cart.findOne({ userId: req.userId }).populate("products.productId");

    if (!cart || !cart.products || cart.products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart is empty",
        data: [],
      });
    }

    // Safely filter only products where productId is valid and populated
    const filteredProducts = cart.products.filter(item => item.productId && item.productId._id);

    // If no valid products after filtering
    if (filteredProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No valid products found in cart",
        data: [],
      });
    }

    // Format the filtered products
    const formattedProducts = filteredProducts.map((item) => ({
      _id: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      image: item.productId.image,
      category: item.productId.category,
      stock: item.productId.stock,
      quantity: item.quantity,
      description: item.productId.description || "",
      source: item.source || "manual", 
    }));

    // Send the response
    return res.status(200).json({
      success: true,
      message: "Cart items fetched successfully",
      userId: cart.userId,
      data: formattedProducts,
    });

  } catch (error) {
    console.error("Error fetching cart:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const removeItemFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - You are not logged in",
      });
    }

    // Pull the product from the cart array
    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      {
        $pull: {
          products: { productId: productId }, // remove matching product from array
        },
      },
      { new: true }
    ).populate("products.productId");

    if (!updatedCart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found or product not found in cart",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product removed from cart successfully",
      data: updatedCart.products,
    });

  } catch (error) {
    console.error("Error removing item from cart:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
