import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587, // or 465
      secure: true,
      auth: {
        user: process.env.Company_Mail,
        pass: process.env.Company_Pass
      }
    });

    const mailOptions = {
      from: `"OCR Auth" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email has been sent successfully", info.response);
    return true;
  } catch (error) {
    console.error("There is an error sending email:", error);
    return false;
  }
};

export default sendEmail;
