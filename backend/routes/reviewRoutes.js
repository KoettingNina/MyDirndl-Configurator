import express from "express";
const router = express.Router();
import {
  getAllReviews,
  addReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { checkAuth } from "../middlewares/authMiddleware.js";

// connect routes to controller functions
router.get("/", getAllReviews);
router.post("/:orderItemId/review", checkAuth,addReview);
router.put("/:orderItemId/review", checkAuth,updateReview);
router.delete("/:orderItemId/review", checkAuth,deleteReview);

export default router;
