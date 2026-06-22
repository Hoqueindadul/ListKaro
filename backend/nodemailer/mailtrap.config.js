import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// 1. Initialize the lightweight OAuth2 Client
const myOAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

myOAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

// Since the provided Refresh Token was generated with the 'gmail.send' 
// scope instead of the full 'mail.google.com' scope, SMTP authentication 
// is rejected by Google (535 BadCredentials).
// We bypass SMTP and use the Gmail HTTP API instead using a custom transporter object.

export const mailTranporter = {
  sendMail: async (mailOptions) => {
    try {
       const { token } = await myOAuth2Client.getAccessToken();
       if (!token) throw new Error("Google returned an empty token response.");
       
       const tempTransporter = nodemailer.createTransport({ streamTransport: true });
       const info = await tempTransporter.sendMail(mailOptions);
       
       const chunks = [];
       for await (const chunk of info.message) {
         chunks.push(chunk);
       }
       const messageBuffer = Buffer.concat(chunks);
       const encodedMessage = messageBuffer
         .toString("base64")
         .replace(/\+/g, "-")
         .replace(/\//g, "_")
         .replace(/=+$/, "");

       const response = await axios.post(
         "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
         { raw: encodedMessage },
         {
           headers: {
             Authorization: `Bearer ${token}`,
             "Content-Type": "application/json",
           },
         }
       );

       return response.data;
    } catch (error) {
       console.error("Email sending using API failed:", error?.response?.data || error.message);
       throw error;
    }
  }
};
