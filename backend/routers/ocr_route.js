import express from 'express';
import axios from 'axios';
import multer from 'multer';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config(); 

const router = express.Router();

const AZURE_KEY = process.env.AZURE_KEY;
const AZURE_ENDPOINT = process.env.AZURE_ENDPOINT;
const AZURE_OCR_URL = `${AZURE_ENDPOINT}vision/v3.2/read/analyze`;



const upload = multer({ dest: 'uploads/' });

router.post('/upload-ocr', upload.single('image'), async (req, res) => {
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


    const lines = result.flatMap(page => page.lines.map(line => line.text));
    const parsedItems = lines.map(text => {
      // Split on first match of -, =, :, →, or -> (with or without surrounding spaces)
      const match = text.match(/^(.*?)\s*[-=:→]\s*(.*)$/);
      if (match) {
        const item = match[1].trim();
        const quantity = match[2].trim();
        return { item, quantity };
      } else {
        return { item: text, quantity: null }; // fallback if no separator
      }
    });
    
    res.json({ parsedItems });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong during OCR.' });
  }
});

export default router;
