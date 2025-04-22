import Cart from "../models/cart.model.js";
import Products from "../models/products.model.js"

export const getUserCart = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - user not logged in",
      });
    }

    // Find the cart for the current user and populate product details
    const cart = await Cart.findOne({ userId: req.userId }).populate("products.productId");

    if (!cart || cart.products.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty",
        data: [],
      });
    }

    // Format the products for frontend use
    const formattedProducts = cart.products.map((item) => ({
      _id: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      image: item.productId.image,
      category: item.productId.category,
      stock: item.productId.stock,
      quantity: item.quantity,
      source: item.source || "manual",
    }));

    return res.status(200).json({
      success: true,
      message: "Cart items fetched successfully",
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
