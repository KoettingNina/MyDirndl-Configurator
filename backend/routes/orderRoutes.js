import express from "express";
import {
  getOrdersByCustomerId,
  getOrderById,
  createOrder,
  findOrderItem,
} from "../controllers/orderController.js";
import { addReview } from "../controllers/reviewController.js";
import { checkAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();
// connect routes to controller functions
router.get("/:customerId/orders", checkAuth, getOrdersByCustomerId);
router.get("/:orderId", checkAuth,getOrderById);

router.post("/:Id", checkAuth,createOrder);

router.get("/find/:orderId", findOrderItem);

export default router;
