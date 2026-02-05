import express from "express";
import {
  createOrderItem,
  getStatus,
  getOrderItem,
  changeStatusPaid,
  deleteOrderItem,
  updateOrder,
} from "../controllers/orderItemController.js";
import { checkAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", checkAuth, createOrderItem);
router.get("/status/:id", checkAuth,getStatus);
router.get("/item/:id", checkAuth,getOrderItem);

router.post("/statusPaid/:id", checkAuth,changeStatusPaid);

router.delete("/item/:id", checkAuth,deleteOrderItem);

router.post("/order/:orderId", checkAuth,updateOrder);

export default router;
