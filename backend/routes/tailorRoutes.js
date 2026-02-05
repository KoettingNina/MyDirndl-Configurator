import express from "express";
import {
  register,
  login,
  logout,
  addItemToTailor,
  getItemsToTailor,
  deleteItemOfTailor,
  getTailorById,
  updateStatus,
  getCapacity,
  setCapacity,
  getFinishedItems,
  addToFinishedItems,
  getTailorDetails,
  changeTailorDetails,
  getAvailableTailors
} from "../controllers/tailorController.js";
import { checkAuth } from "../middlewares/authMiddleware.js";
import { get } from "mongoose";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.post("/:id/items/add", checkAuth,addItemToTailor, checkAuth);
router.get("/items/:id", checkAuth,getItemsToTailor, checkAuth); //, checkAuth);

router.delete("/:id1/items/:id2", checkAuth,deleteItemOfTailor);
router.get("/availableTailors", checkAuth,getAvailableTailors);

router.get("/:id", checkAuth,getTailorById);

router.post("/orderItem/:orderItemId", checkAuth,updateStatus);

//Capacity
router.get("/capacity/:id", checkAuth,getCapacity);
router.post("/capacity/:id", checkAuth,setCapacity);

//Finished Items
router.get("/finishedItems/:id", checkAuth,getFinishedItems);
router.post("/finishedItems/:id", checkAuth,addToFinishedItems);

//Tailor Details
router.get("/tailorDetails/:id", checkAuth, getTailorDetails);
router.put("/tailorDetails/:id", checkAuth,changeTailorDetails);



export default router;
