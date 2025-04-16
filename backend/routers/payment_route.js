import express from 'express'
import Razorpay from "razorpay";
import dotenv from 'dotenv'
dotenv.config();

const paymentRoute = express.Router();

const instance = new Razorpay({
    key_id: process.env.Razor_Key_Id,
    key_secret: process.env.Razor_Sec_Key,
});

paymentRoute.post('/payment', async(req, res)=> {
    const { price } = req.body;
    try{
        const options = {
            amount: price *100, 
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };
        const order = await instance.orders.create(options);
        res.status(200).json(order);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create Razorpay order" });
    }
})

export default paymentRoute;