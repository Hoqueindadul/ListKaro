import Product from "../models/products.model.js";
import Cart from "../models/cart.model.js";

export const bulkUploadProducts = async (req, res) => {
    try {
        const userId = req.userId;
        const { products } = req.body; // array of { name, quantity, source }

        if (!products || !Array.isArray(products)) {
            return res.status(400).json({ success: false, message: "Invalid products format" });
        }

        const matchedProducts = [];
        const addedItems = [];
        const notFoundItems = [];

        const STOP_WORDS = ['amul', 'brand', 'pack', 'offer', 'new']; 

        for (const item of products) {
            const quantity = parseQuantity(item.quantity);
            const source = item.source || "manual";
            const rawName = item.name.trim();

            // Prepare keyword-based regex pattern
            const keywords = rawName
                .toLowerCase()
                .split(/\s+/)
                .filter(word => word.length > 2 && !STOP_WORDS.includes(word)); // remove short/common words

            if (keywords.length === 0) {
                notFoundItems.push({ name: rawName, quantity });
                continue;
            }

            const regexPattern = keywords.map(word => `(?=.*${word})`).join('');
            const regex = new RegExp(regexPattern, 'i');

            // Find product using keyword-matching regex
            const product = await Product.findOne({ name: { $regex: regex } });

            if (product) {
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
            } else {
                notFoundItems.push({ name: rawName, quantity });
            }
        }

        // Update or create cart
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, products: matchedProducts });
        } else {
            for (const newItem of matchedProducts) {
                const existingIndex = cart.products.findIndex(
                    p => p.productId.toString() === newItem.productId.toString()
                );

                if (existingIndex !== -1) {
                    cart.products[existingIndex].quantity += newItem.quantity;
                } else {
                    cart.products.push(newItem);
                }
            }
        }

        await cart.save();

        return res.status(200).json({
            success: true,
            message: `Bulk upload completed. ${addedItems.length} added, ${notFoundItems.length} not found.`,
            addedItems,
            notFoundItems: notFoundItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                message: `Product "${item.name}" not found in the database.`
            }))
        });
        

    } catch (err) {
        console.error("Bulk Upload Error:", err);
        return res.status(500).json({ success: false, message: "Bulk upload failed" });
    }
};

function parseQuantity(qty, productUnit = "unit") {
    const str = qty.toLowerCase().replace(/\s+/g, "");
    let match = str.match(/^(\d+)(ml|l|g|kg)?$/);

    if (!match) return 1;

    let value = parseFloat(match[1]);
    let unit = match[2];

    if (!value || value < 1) return 1;

    switch (unit) {
        case "g": return value / 1000;   // convert to kg
        case "ml": return value / 1000;  // convert to liter
        case "kg":
        case "l": return value;
        default: return value; // treat plain number as quantity
    }
}
