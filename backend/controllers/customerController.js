import mongoose from "mongoose";
import CustomerAccount from "../models/customerModel.js";
import Dirndl from "../models/dirndlModel.js";
import InspirationPost from "../models/inspirationPostModel.js";
import jwt from "jsonwebtoken";
import axios from "axios";

//ROUTE POST /api/users/register
// adds new user
const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      password,
      paymentMethod,
      deliveryAddress,
      billingAddress,
      favoriteList,
      shoppingCart,
    } = req.body;

    if (!firstName || !lastName || !username || !password) {
      res.status(400).json({ error: "Please fill in all fields" });
    }

    // E-Mail-Validierung
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(username)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    //e-mail to lowercase
    const lowercaseUsername = username.toLowerCase();

    //Password length must be at least 6 characters
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const customerAlreadyExists = await CustomerAccount.findOne({
      username: lowercaseUsername,
    });
    if (customerAlreadyExists) {
      throw new Error(
        "Customer with username " + lowercaseUsername + " already exists"
      );
    }

    const newCustomer = await CustomerAccount.create({
      firstName,
      lastName,
      username: lowercaseUsername,
      password,
      paymentMethod,
      deliveryAddress,
      billingAddress,
      favoriteList,
      shoppingCart,
    });

    console.log(newCustomer);
    genToken(res, newCustomer._id);

    res.status(201).json({
      _id: newCustomer._id,
      firstName: newCustomer.firstName,
      lastName: newCustomer.lastName,
      username: newCustomer.username,
      password: newCustomer.password,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
//ROUTE POST /api/users/login
// login of user
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Please fill in all fields" });
    }

    //e-mail to lowercase
    const lowercaseUsername = username.toLowerCase();

    const customer = await CustomerAccount.findOne({
      username: lowercaseUsername,
    });

    if (!customer) {
      return res.status(400).json({ error: "User not found" });
    }

    console.log(customer._id);

    if (customer && (await customer.checkPassword(password))) {
      const token = genToken(res, customer._id);
      res.status(200).json({
        _id: customer._id,
        username: customer.username,
        password: customer.password,
        token: token,
      });
    } else {
      throw new Error("Invalid username or password");
    }
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

//ROUTE POST /api/users/logout
// logout of user
const logout = async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    sameSite: "Strict",
    expires: new Date(0),
  });
  res.cookie("user", "", {
    httpOnly: true,
    sameSite: "Strict",
    expires: new Date(0),
  });
  res.status(200).json({ message: "Customer logged out" });
};

const genToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: 86400000,
  });
  res.cookie("jwt", token, {
    httpOnly: true,
    sameSite: "Strict",
    expires: new Date(Date.now() + 86400000),
  });
  res.cookie("user", userId, {
    httpOnly: true,
    sameSite: "Strict",
    expires: new Date(Date.now() + 86400000),
  });
  return token;
};

//ROUTE GET /api/customers/favoriteList/:id
//get all favorites of a user
const getAllFavorites = async (req, res) => {
  try {
    const customerId = req.params.id;
    const customer = await CustomerAccount.findById(customerId).populate({
      path: "favoriteList",
      populate: {
        path: "orderItemConnection",
        populate: {
          path: "dirndl",
        },
      },
    });
    if (!customer) {
      throw new Error("Customer not found");
    }
    res.status(200).json(customer.favoriteList);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const addToFavorites = async (req, res) => {
  try {
    const customerId = req.params.id;
    const { favoriteItem } = req.body;

    const customer = await CustomerAccount.findById(customerId);
    if (!customer) {
      throw new Error("Customer not found");
    }

    customer.favoriteList.push(favoriteItem);
    await customer.save();

    res.status(200).json(customer.favoriteList);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteFromFavourites = async (req, res) => {
  try {
    const customerId = req.params.id;
    const { favoriteItem } = req.body;

    const customer = await CustomerAccount.findById(customerId);
    if (!customer) {
      throw new Error("Customer not found");
    }

    //deletes the item from favorite List of the customer
    const index = customer.favoriteList.indexOf(favoriteItem);
    if (index > -1) {
      customer.favoriteList.splice(index, 1);
    }

    await customer.save();

    // reduce the number of likes of the inspirationPost
    const inspirationPost = await InspirationPost.findById(favoriteItem);
    if (inspirationPost) {
      inspirationPost.likes = Math.max(0, inspirationPost.likes - 1); // make sure we don't get a negative number
      await inspirationPost.save();
    }

    res.status(200).json(customer.favoriteList);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//ROUTE POST /api/customers/addSaved/:customerId
const addToSaved = async (req, res) => {
  try {
    const { customerId } = req.params;
    const dirndlId = req.body.dirndlId;

    const customer = await CustomerAccount.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    customer.savedList.push(dirndlId);
    await customer.save();

    res.status(200).json(customer.savedList);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//ROUTE GET /api/customers/saved/:customerId
const getSaved = async (req, res) => {
  try {
    const { customerId } = req.params;
    const customer = await CustomerAccount.findById(customerId).populate({
      path: "savedList",
      model: "Dirndl",
    });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json(customer.savedList);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving favorites", error });
  }
};

//ROUTE DELETE /api/customers/removeSaved/:customerId/:
//delete the item from the savedList of the customer
const removeSaved = async (req, res) => {
  try {
    const { customerId, dirndlId } = req.params;
    console.log(customerId, dirndlId);
    const customer = await CustomerAccount.findByIdAndUpdate(
      customerId,
      { $pull: { savedList: dirndlId } },
      { new: true }
    ).populate({
      path: "savedList",
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json(customer.savedList);
  } catch (error) {
    res.status(500).json({ message: "Error removing favorite", error });
  }
};

const getShoppingCart = async (req, res) => {
  try {
    const customerId = req.params.id;
    const customer = await CustomerAccount.findById(customerId);
    if (!customer) {
      throw new Error("Customer not found");
    }
    res.status(200).json(customer.shoppingCart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const addToShoppingCart = async (req, res) => {
  try {
    const customerId = req.params.id;
    const { shoppingCartItemID } = req.body;

    console.log("Received customerId:", customerId);
    console.log("Received shoppingCartItemID:", shoppingCartItemID);

    if (!mongoose.Types.ObjectId.isValid(shoppingCartItemID)) {
      return res.status(400).send("Invalid ObjectID");
    }

    const customer = await CustomerAccount.findById(customerId);
    if (!customer) {
      throw new Error("Customer not found");
    }

    customer.shoppingCart.push(shoppingCartItemID);
    await customer.save();

    res.status(200).json(customer.shoppingCart);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

const deleteFromShoppingCart = async (req, res) => {
  try {
    const customerId = req.params.id;
    const { shoppingCartItem } = req.body;

    const customer = await CustomerAccount.findById(customerId);
    if (!customer) {
      throw new Error("Customer not found");
    }

    // if (!mongoose.Types.ObjectId.isValid(shoppingCartItem._id)) {
    //   return res.status(400).send("Invalid ObjectID");
    // }

    const index = customer.shoppingCart.findIndex((itemId) =>
      itemId.equals(shoppingCartItem._id)
    );
    if (index > -1) {
      customer.shoppingCart.splice(index, 1);
    }

    await customer.save();
    res.status(200).json(customer.shoppingCart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//ROUTE GET /api/customers/userDetails/:id
const getUserDetails = async (req, res) => {
  //trying to get first name, las name, delivery address, billing address, payment method
  try {
    const customerId = req.params.id;
    const customer = await CustomerAccount.findById(customerId);
    if (!customer) {
      throw new Error("Customer not found");
    }

    console.log("Customer data:", customer); // Logging der Kundendaten

    res.status(200).json({
      firstName: customer.firstName,
      lastName: customer.lastName,
      deliveryAddress: customer.deliveryAddress,
      billingAddress: customer.billingAddress,
      paymentMethod: customer.paymentMethod,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const changeUserDetails = async (req, res) => {
  try {
    const customerId = req.params.id;
    const { firstName, lastName, deliveryAddress, billingAddress } = req.body;

    const customer = await CustomerAccount.findById(customerId);
    if (!customer) {
      throw new Error("Customer not found");
    }

    customer.firstName = firstName;
    customer.lastName = lastName;
    customer.deliveryAddress = deliveryAddress;
    customer.billingAddress = billingAddress;
    await customer.save();

    res.status(200).json({
      firstName: customer.firstName,
      lastName: customer.lastName,
      deliveryAddress: customer.deliveryAddress,
      billingAddress: customer.billingAddress,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const emptyShoppingCart = async (req, res) => {
  try {
    const customerId = req.params.id;

    const customer = await CustomerAccount.findById(customerId);
    if (!customer) {
      throw new Error("Customer not found");
    }

    customer.shoppingCart = [];

    await customer.save();

    res.status(200).json(customer.shoppingCart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export {
  register,
  login,
  logout,
  getAllFavorites,
  addToFavorites,
  addToSaved,
  getSaved,
  removeSaved,
  deleteFromFavourites,
  getShoppingCart,
  addToShoppingCart,
  deleteFromShoppingCart,
  getUserDetails,
  changeUserDetails,
  emptyShoppingCart,
};
