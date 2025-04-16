import express from 'express';
import Newsletter from '../models/newsletter_model.js';

const newsletterRoute = express.Router();

newsletterRoute.post('/subscribe', async (req, res) => {
    const { email } = req.body;
    
    if (!email) return res.status(400).json({ message: 'Please enter a valid email' });

    try {

        const existingUser = await Newsletter.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'You are already subscribed to ListKaro.' });
        }

        const newSub = new Newsletter({ email });
        await newSub.save();

        res.status(201).json({ message: 'Congratulations! You subscribed to ListKaro' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong! Please try again later' });
    }
});

export default newsletterRoute;
