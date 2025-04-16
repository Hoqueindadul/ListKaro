import express from 'express';
import { registerUser} from '../controlers/user.controlers.js';  

const router = express.Router();

router.route("/register").post(registerUser)

export default router;