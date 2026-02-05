import express from "express";
import {createPaymentIntent, handlePaymentSuccess} from "../controllers/paymentController.js";
import {checkAuth} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create-payment-intent", checkAuth,createPaymentIntent);
router.post("/payment-success", checkAuth,handlePaymentSuccess);

export default router;