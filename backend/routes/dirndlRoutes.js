import express from "express";
import {
  getDirndl,
  createDirndl,
  saveDirndl,
  deleteDirndl,
} from "../controllers/dirndlController.js";
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

const upload = multer({ storage: storage });

router.post("/upload", checkAuth, upload.single("image"), saveDirndl);

router.get("/get/:id", checkAuth, getDirndl);
router.post("/create", checkAuth, createDirndl);
router.delete("/delete/:dirndlId", checkAuth, deleteDirndl);

export default router;
