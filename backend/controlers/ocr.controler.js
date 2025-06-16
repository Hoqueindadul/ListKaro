import fs from 'fs';
import axios from 'axios';
import Products from '../models/products.model.js';
import Cart from '../models/cart.model.js';

const AZURE_KEY = process.env.AZURE_KEY;
const AZURE_ENDPOINT = process.env.AZURE_ENDPOINT;
const AZURE_OCR_URL = AZURE_ENDPOINT + 'vision/v3.2/read/analyze';

export const extractProductDataFromImage = async (req, res) => {
    try {
        const imagePath = req.file.path;
        const imageData = fs.readFileSync(imagePath);

        const headers = {
            'Ocp-Apim-Subscription-Key': AZURE_KEY,
            'Content-Type': 'application/octet-stream',
        };

        const response = await axios.post(AZURE_OCR_URL, imageData, { headers });
        const operationLocation = response.headers['operation-location'];

        let result;
        let attempts = 0;
        while (attempts < 10) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const resultRes = await axios.get(operationLocation, {
                headers: { 'Ocp-Apim-Subscription-Key': AZURE_KEY },
            });

            if (resultRes.data.status === 'succeeded') {
                result = resultRes.data.analyzeResult.readResults;
                break;
            } else if (resultRes.data.status === 'failed') {
                return res.status(400).json({ error: 'OCR failed.' });
            }

            attempts++;
        }

        fs.unlinkSync(imagePath);

        const allLines = result.flatMap(page => page.lines.map(line => line.text));

        // Step 1: Merge broken lines like "Grapes -" and "2 kg"
        const mergedLines = [];
        for (let i = 0; i < allLines.length; i++) {
            const current = allLines[i];
            const next = allLines[i + 1] || "";

            // Merge if current ends with separator and next has quantity
            if (/[\-:=]\s*$/.test(current) && /\d+(\.\d+)?\s*(kg|g|lb|oz|ml|liter)/i.test(next)) {
                mergedLines.push(`${current} ${next}`);
                i++; // skip next line
            } else {
                mergedLines.push(current);
            }
        }

        // Step 2: Extract product and quantity using regex
        const keyValuePairs = {};
        const regex = /([a-zA-Z\s]+)[\s\-:=]+(\d+(\.\d+)?\s*(kg|g|lb|oz|ml|liter)?)/i;

        for (const line of mergedLines) {
            const match = line.match(regex);
            if (match) {
                const productName = match[1].trim();
                const quantityText = match[2].trim();
                keyValuePairs[productName] = quantityText;
            }
        }

        const results = {};

        for (const [productName, quantityText] of Object.entries(keyValuePairs)) {
            const product = await Products.findOne({ name: new RegExp(`^${productName}$`, 'i') });

            if (product) {
                const qtyMatch = quantityText.match(/\d+/);
                const numericQty = qtyMatch ? parseInt(qtyMatch[0]) : 1;

                if (!req.userId) {
                    return res.status(401).json({ success: false, message: "User is not authenticated" });
                }

                let cart = await Cart.findOne({ userId: req.userId });

                if (!cart) {
                    cart = new Cart({
                        userId: req.userId,
                        products: [],
                    });
                }

                const existingProductIndex = cart.products.findIndex(
                    item => item.productId.toString() === product._id.toString()
                );

                if (existingProductIndex !== -1) {
                    cart.products[existingProductIndex].quantity += numericQty;
                } else {
                    cart.products.push({
                        productId: product._id,
                        quantity: numericQty,
                        source: 'ocr',
                    });
                }

                await cart.save();

                results[productName] = {
                    found: true,
                    cartAdded: true,
                    product: {
                        _id: product._id,
                        name: product.name,
                        price: product.price,
                        category: product.category,
                        image: product.image,
                        stock: product.stock,
                        quantityDetected: quantityText,
                    },
                };
            } else {
                results[productName] = {
                    found: false,
                    cartAdded: false,
                    quantityDetected: quantityText,
                    message: `'${productName}' not found in the database.`,
                };
            }
        }

        let totalProductsAdded = Object.values(results).filter(item => item.cartAdded).length;

        return res.status(200).json({
            success: true,
            message: 'Products added to cart successfully.',
            totalProductsAdded,
            lines: allLines,
            data: results,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong during OCR.' });
    }
};
