import express from "express";
import {
  createInspirationPost,
  deleteInspirationPost,
  getInspirationPostOfUser,
  getAllInspirationPosts,
  getInspirationPostByOrderItem,
  likePost,
} from "../controllers/inspirationPostController.js";
import multer from "multer";

import { checkAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Set up Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Speicherort für hochgeladene Dateien
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// const upload = multer({ storage }).single("wornPicture");
const upload = multer({ storage: storage });

router.post(
  "/create",
  checkAuth,
  upload.single("wornPicture"),
  createInspirationPost
);
router.delete("/delete/:postId", checkAuth, deleteInspirationPost);
router.get("/getPosts/:id", checkAuth, getInspirationPostOfUser);
router.get("/all", getAllInspirationPosts);
router.get("/:orderItemId", getInspirationPostByOrderItem);
router.post("/:id/like", checkAuth, likePost);

export default router;
