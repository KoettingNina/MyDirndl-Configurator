import express from "express";
import {
  register,
  login,
  logout,
  getAllFavorites,
  deleteFromFavourites,
  getShoppingCart,
  addToShoppingCart,
  deleteFromShoppingCart,
  addToSaved,
  getSaved,
  removeSaved,
  getUserDetails,
  changeUserDetails,
  emptyShoppingCart,
} from "../controllers/customerController.js";
import { checkAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

//get all favorites from the customer
router.get("/favoriteList/:id",checkAuth, getAllFavorites);

router.put("/removeFavorite/:id", checkAuth,deleteFromFavourites);

//saving a dirndl in the account
router.post("/addSaved/:customerId", checkAuth,addToSaved);
router.get("/saved/:customerId", checkAuth,getSaved);
router.delete("/removeSaved/:customerId/:dirndlId", checkAuth,removeSaved);

//Base routes from a customer
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/userDetails/:id", checkAuth, getUserDetails);
router.put("/userDetails/:id", checkAuth,changeUserDetails);

//Routes for Shopping Cart

//Route /api/customer/shoppingCart/get
router.get("/shoppingCart/:id", checkAuth, getShoppingCart);
router.post("/shoppingCart/:id", checkAuth, addToShoppingCart);
router.delete("/shoppingCart/:id", checkAuth, deleteFromShoppingCart);
router.delete("/shoppingCart/empty/:id", checkAuth, emptyShoppingCart);

export default router;
