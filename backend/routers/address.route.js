import express from "express";
import {
  saveDeliveryAddress,
  getAllAddress,
  updateDeliveryAddress,
  deleteDeliveryAddress,
} from "../controlers/addresses.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
const router = express.Router();

router.post("/save-address", verifyToken, saveDeliveryAddress);
router.get("/get-all-address", verifyToken, getAllAddress);
router.put("/update-address/:addressId", verifyToken, updateDeliveryAddress);
router.delete("/delete-address/:addressId", verifyToken, deleteDeliveryAddress);

export default router;
