import Product from "../models/products.model.js";
import Cart from "../models/cart.model.js";

export const bulkUploadProducts = async (req, res) => {
    try {
        const userId = req.userId;
        const { products } = req.body; // array of { name, quantity, source (optional) }

        if (!products || !Array.isArray(products)) {
            return res.status(400).json({ success: false, message: "Invalid products format" });
        }

        const matchedProducts = [];
        const addedItems = [];

        for (const item of products) {
            const product = await Product.findOne({ name: new RegExp("^" + item.name + "$", "i") });
            if (product) {
                const quantity = parseQuantity(item.quantity);
                const source = item.source || "manual";

                matchedProducts.push({
                    productId: product._id,
                    quantity,
                    source,
                });

                addedItems.push({
                    name: product.name,
                    quantity,
                    source,
                });
            }
        }

        // Step 2: Update or create cart
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, products: matchedProducts });
        } else {
            cart.products = matchedProducts;
        }

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Bulk upload successful. Cart updated.",
            addedItems,
        });

    } catch (err) {
        console.error("Bulk Upload Error:", err);
        return res.status(500).json({ success: false, message: "Bulk upload failed" });
    }
};

function parseQuantity(qty) {
    const num = parseInt(qty);
    return isNaN(num) || num < 1 ? 1 : num;
}