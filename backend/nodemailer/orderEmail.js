import nodemailer from "nodemailer";
import express from "express";

const orderEmail = express.Router();

orderEmail.post("/sendconfirmationemail", async (req, res) => {
    const { to, name, items, total, address, zip, email, phone } = req.body;

    const itemList = items.map(item => `${item.name} - ₹${item.price}`).join("<br>");

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.Company_Mail,
            pass: process.env.Company_Pass,
        },
    });

    const mailOptions = {
        from: `"ListKaro" <${process.env.Company_Mail}>`,
        to: `${to}, ${process.env.Company_Mail}`,
        subject: "Order Confirmation from Listkaro",
        html: `
        <div style="background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%); color: white; max-width: 500px; font-size: 18px; padding: 20px; border-radius: 30px;">
            <div style="display: flex; justify-content: center; align-items: center; gap: 10px; margin-bottom: 20px;">
                <img src="https://i.imgur.com/R2aSKKN.png" alt="Logo" height="60" width="60">
                <h2>ListKaro</h2>
            </div>

            <div style="background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%); padding: 20px; border-radius: 30px;">
                <p>
                Dear ${name}, <br><br>
                Thank you for shopping with ListKaro! 🧡 <br>
                We truly appreciate your order and hope you enjoy your items. <br><br>

                Here's some exciting news — our Weekly Deals are live now! <br>
                Get up to 80% OFF on daily essentials, dairy products, snacks, and more. Stock up and save big while the offers last!
                <br><br>       
                Visit our store for more information <br><br>
                👉 <a href="http://localhost:5173/" 
                    style="background: transparent; color: #00ffff; border: 2px solid #00ffff; padding: 10px 20px; border-radius: 8px; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; box-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff inset; text-decoration: none; display: inline-block;">
                    Visit Store
                </a>
                <br><br>
                Happy shopping! <br><br>
                Team ListKaro
                </p>
            </div>

            <div style="background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%); font-size: 16px; padding: 20px; border-radius: 30px;">
                <p><strong>Here is your Order Summary</strong></p>
                ${itemList}
                <p><strong>Total Amount to be paid:</strong> ₹${total}</p>
                <p style="font-size: 14px;">(Ignore if already paid)</p>
            </div>

            <div style="background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%); font-size: 16px; padding: 20px; border-radius: 30px;">
                <u style="font-size: 18px;">Billing Details</u>
                <p>Customer: ${name}</p>
                <p>Address: ${address}</p>
                <p>Zip Code: ${zip}</p>
                <p>Email: ${email}</p>
                <p>Phone: ${phone}</p>
            </div>
        </div>
        `,

    };
    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Confirmation email sent." });
    } catch (error) {
        console.error("Email error:", error);
        res.status(500).json({ message: "Failed to send email" });
    }
});

export default orderEmail;
