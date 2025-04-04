import { mailTranporter } from "./mailtrap.config.js";
import { VERIFICATION_EMAIL_TEMPLATE, WELCOME_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } from "./emailTemplate.js";

export const sendVarificationEmail = async (email, varificationToken) => {
    try {
        const response = await mailTranporter.sendMail({
            from: "calender3434@gmail.com",
            to: email,
            subject: "Varify you email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", varificationToken),
            category: "Email Verification",
        })
        console.log("Email sent successfully:", response);
    } catch (error) {
        throw new Error(`Error sending varification email: ${error}`)
    }
}


export const sendWelcomeEmail = async (email, name) => {

    try {
        const response = await mailTranporter.sendMail({
            from: "calender3434@gmail.com",
            to: email,
            subject: "Varify you email",
            html: WELCOME_TEMPLATE.replace("{name}", name),
            text: `Welcome ${name}, we are glad to have you on board`,
            category: "Welcome",
        })
        console.log("Welcome Email sent successfully:", response);
    } catch (error) {
        
    }
}


export const sendPasswordResetEmail = async (email, resetURL) => {
    try {
        console.log(resetURL)
        const response = await mailTranporter.sendMail({
            from: "calender3434@gmail.com",
            to: email,
            subject: "Reset your password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            category: "Password reset",
        })
        console.log("Password reset request Email sent successfully:", response);

    } catch (error) {
        console.error(error)
        throw new Error(`Error sending password reset email: ${error}`)
    }
}


export const sendResetSuccessEmail = async (email) => {
    try {
        const response = await mailTranporter.sendMail({
            from: "calender3434@gmail.com",
            to: email,
            subject: "Password reset successfull",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password reset",
        })
        console.log("Password reset Email sent successfully:", response);

    } catch (error) {
        console.error(error)
        throw new Error(`Error sending password reset successfull email: ${error}`)
    }
}