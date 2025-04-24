import fs from 'fs';
import axios from 'axios';
import Products from '../models/products.model.js';
import Cart from '../models/cart.model.js';

const AZURE_KEY = '341qYo40r0EeSr32UoRv3IYnxACap3Oc0qd4OXPSAv7TAv8ttADdJQQJ99BDACGhslBXJ3w3AAAFACOGlGwA';
const AZURE_ENDPOINT = 'https://jabedindadualocr.cognitiveservices.azure.com/';
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

    const keyValuePairs = {};
    const allLines = result.flatMap(page => page.lines.map(line => line.text));

    // Pair every two lines
    for (let i = 0; i < allLines.length - 1; i += 2) {
      const key = allLines[i];           // e.g., "Mango"
      const value = allLines[i + 1];     // e.g., "2 kg"
      keyValuePairs[key] = value;
    }
    const results = {};

    for (const [key, quantityText] of Object.entries(keyValuePairs)) {
      const product = await Products.findOne({ name: new RegExp(`^${key}$`, 'i') });

      if (product) {
        const qtyMatch = quantityText.match(/\d+/);
        const numericQty = qtyMatch ? parseInt(qtyMatch[0]) : 1;

        // Check if the user is logged in (userId should be available if token is verified)
        if (!req.userId) {
          return res.status(401).json({ success: false, message: "User is not authenticated" });
        }

        // Find the user's cart, create one if it doesn't exist
        let cart = await Cart.findOne({ userId: req.userId });

        // If cart doesn't exist, create it
        if (!cart) {
          cart = new Cart({
            userId: req.userId,
            products: [],
          });
        }

        // Check if the product already exists in the cart
        const existingProductIndex = cart.products.findIndex(
          item => item.productId.toString() === product._id.toString()
        );

        if (existingProductIndex !== -1) {
          // If the product exists, update its quantity
          cart.products[existingProductIndex].quantity += numericQty;
        } else {
          // If the product doesn't exist, add it to the cart
          cart.products.push({
            productId: product._id,
            quantity: numericQty,
            source: 'ocr', // Indicate that this item was added via OCR
          });
        }

        // Save the updated cart
        await cart.save();

        results[key] = {
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
        results[key] = {
          found: false,
          cartAdded: false,
          quantityDetected: quantityText,
          message: `'${key}' not found in the database.`,
        };
      }
    }

    let totalProductsAdded = Object.values(results).filter(item => item.cartAdded).length;

    return res.status(200).json({
      success: true,
      message: 'Products added to cart successfully.',
      totalProductsAdded,
      data: results,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong during OCR.' });
  }
};
