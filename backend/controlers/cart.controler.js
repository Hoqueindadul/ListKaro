import Cart from "../models/cart.model.js";
import Products from "../models/products.model.js";

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

    if (!cart || cart.products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart is empty",
        data: [],
      });
    }

    // Debugging: Log raw cart data to inspect
    console.log("Raw Cart Data:", JSON.stringify(cart, null, 2));

    // Check if any productId in cart couldn't be populated
    cart.products.forEach((item, index) => {
      if (!item.productId) {
        console.warn(`⚠️ Warning: productId at index ${index} could not be populated.`);
      }
    });

    // Filter out products where productId could not be populated
    const filteredProducts = cart.products.filter(item => item.productId);

    // Format the data to send back to the frontend
    const formattedProducts = filteredProducts.map((item) => ({
      _id: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      image: item.productId.image,
      category: item.productId.category,
      stock: item.productId.stock,
      quantity: item.quantity,
      description: item.productId.description || "",
      source: item.source || "manual", // or 'OCR' based on how product was added
    }));

    // Respond with the formatted cart items
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
