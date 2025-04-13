import express from "express";
import User from "../models/users.model.js";
import sendEmail from "../utils/sendEmail.js";

const authRoutes = express.Router();

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();


export default authRoutes;
