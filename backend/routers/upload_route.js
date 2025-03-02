import express from 'express';
import multer from 'multer';
import path from 'path';
import ImageModel from '../Models/image_model.js';

const router = express.Router();

const upload = multer({
    storage: multer.diskStorage({
        destination: './uploads/',
        filename:(req,file,cb) => {
            const ex = path.extname(file.originalname).toLocaleLowerCase();
            if ( !['.jpg', '.png'].includes(ex)) return cb(new Error('Not allowed'))
            cb(null, `list${ex}`)
        }
    })
})

router.post('/upload', upload.single('file'), async (req, res) => {

    if (!req.file) return res.status(400).json({ message: 'Invalid file!' }); 
    await ImageModel.deleteMany();

    const image = await ImageModel.create({
         name: req.file.filename, 
         imageUrl: `/uploads/${req.file.filename}` });
    res.json({ message: 'List has uploaded!', image });
});

export default router;
