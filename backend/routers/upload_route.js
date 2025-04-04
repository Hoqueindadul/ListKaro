import express from 'express';
import multer from 'multer';
import path from 'path';
import ImageModel from '../models/image_model.js';

const router = express.Router();
const upload = multer({
    storage: multer.diskStorage({
        destination: './uploads/',
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            if (!['.jpg', '.png','.jpeg'].includes(ext)) 
                return cb(new Error('Only .png and .jpg allowed!'));
            cb(null, `list${ext}`);
        }
    })
});

router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Invalid file!' });
    await ImageModel.deleteMany();
    const image = await ImageModel.create({ name: req.file.filename, imageUrl: `/uploads/${req.file.filename}` });
    res.json({ message: 'Uploaded successfully!', image });
});

export default router;
