import express from "express";
import {
  createMeasurement,
  deleteMeasurement,
  getMeasurementByCustomer,
  updateMeasurement,
  getMeasurement,
  checkMeasurementExists,
} from "../controllers/measurementController.js";
import { check } from "express-validator";
import { checkAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

//Extra Ideas for routes

//Base routes for customerMeasurements
router.post("/create", checkAuth, createMeasurement);
//router.put("/update/:id", updateMeasurement);
router.get("/get/:id", checkAuth,getMeasurement);

router.put("/update/:id", checkAuth,updateMeasurement);

router.delete("/delete/:id", checkAuth,deleteMeasurement);

router.get("/getByCustomer/:id", checkAuth,getMeasurementByCustomer);

router.post("/check", checkMeasurementExists);

export default router;
