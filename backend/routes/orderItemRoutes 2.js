import express from "express";
import {
  createOrderItem,
  getStatus,
  getOrderItem,
  changeStatusPaid,
} from "../controllers/orderItemController.js";

const router = express.Router();

router.post("/create", createOrderItem);
router.get("/status/:id", getStatus);
router.get("/item/:id", getOrderItem);
router.put("/statusPaid/:id", changeStatusPaid);

export default router;
