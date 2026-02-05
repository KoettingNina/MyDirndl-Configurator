import TailorAccount from "../models/tailorModel.js";
import jwt from "jsonwebtoken";
import OrderItem from "../models/orderItemModel.js";
import { matchLostOrderItemsWithTailor } from "./orderItemController.js";
import Order from "../models/orderModel.js";
import { set } from "mongoose";
import { findOrderItem } from "./orderController.js";

//ROUTE POST /api/tailors/register
// adds new tailor
const register = async (req, res) => {
  try {
    const {
      username,
      password,
      validated,
      capacity,
      currentCapacity,
      bankInfo,
      itemsToTailor,
    } = req.body;

    // E-Mail validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(username)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    //e-mail to lowercase
    const lowercaseUsername = username.toLowerCase();
    console.log(lowercaseUsername);

    // password should be at least 6 characters long
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    // capacity shouldn't be 0 or negative
    if (capacity < 1) {
      return res.status(400).json({ error: "Capacity must be at least 1" });
    }

    // IBAN/BIC validation
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;
    const bicRegex = /^[A-Z]{4}[A-Z]{2}[A-Z2-9][A-NP-Z0-9]([A-Z0-9]{3})?$/;
    if (!ibanRegex.test(bankInfo) && !bicRegex.test(bankInfo)) {
      return res.status(400).json({ error: "Invalid IBAN or BIC" });
    }

    const tailorAlreadyExists = await TailorAccount.findOne({
      username: lowercaseUsername,
    });
    if (tailorAlreadyExists) {
      throw new Error("Tailor already exists");
    }

    const newTailor = await TailorAccount.create({
      username: lowercaseUsername,
      password,
      validated,
      capacity,
      currentCapacity,
      bankInfo,
      itemsToTailor,
    });

    if (!username || !password || !capacity || !bankInfo) {
      res.status(400).json({ error: "Please fill in all necessary fields" });
    }
    genToken(res, newTailor._id);

    await matchLostOrderItemsWithTailor(req, capacity);

    return res.status(201).json({
      message: "Tailor created",
      _id: newTailor._id,
      username: newTailor.username,
      password: newTailor.password,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//ROUTE POST /api/tailors/login
// logs in tailor
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Please fill in all fields" });
    }

    //e-mail to lowercase
    const lowercaseUsername = username.toLowerCase();
    console.log(lowercaseUsername);

    const tailor = await TailorAccount.findOne({ username: lowercaseUsername });

    if (!tailor) {
      return res.status(400).json({ error: "User not found" });
    }

    if (tailor && (await tailor.checkPassword(password))) {
      const token = genToken(res, tailor._id);
      res.status(200).json({
        _id: tailor._id,
        username: tailor.username,
        password: tailor.password,
        token: token,
      });
    } else {
      throw new Error("Invalid username or password");
    }
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

//ROUTE POST /api/tailors/logout
// logs out tailor
const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const genToken = (res, tailorId) => {
  const token = jwt.sign({ tailorId }, process.env.JWT_SECRET, {
    expiresIn: 86400,
  });
  res.cookie("jwt", token, {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 86400,
  });
  res.cookie("user", tailorId, {
    httpOnly: true,
    sameSite: "Strict",
    expires: new Date(Date.now() + 86400000),
  });
  return token;
};

const addItemToTailor = async (req, res) => {
  try {
    const tailorId = req.params.id;
    const tailor = await TailorAccount.findById(tailorId);
    if (!tailor) {
      throw new Error("Tailor not found");
    }
    const { item } = req.body;
    tailor.itemsToTailor.push(item);
    await tailor.save();
    res.status(200).json({ message: "Item added to tailor" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//ROUTE GET /api/tailors/items/:id
// gets all itemsToTailor for a tailor
const getItemsToTailor = async (req, res) => {
  try {
    const tailorId = req.params.id;
    const tailor = await TailorAccount.findById(tailorId);
    if (!tailor) {
      throw new Error("Tailor not found");
    }

    const itemsToTailor = tailor.itemsToTailor;
    res.status(200).json(itemsToTailor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//ROUTE DELETE /api/tailors/:id1/items/:id2
// deletes an item from a tailor's list of itemsToTailor
const deleteItemOfTailor = async (req, res) => {
  try {
    const tailorId = req.params.id1;
    const itemId = req.params.id2;
    console.log(req.user);

    const tailor = await TailorAccount.findById(tailorId);
    if (!tailor) {
      throw new Error("Tailor not found");
    }
    if (!tailor.itemsToTailor.includes(itemId)) {
      throw new Error("Item not found");
    }

    tailor.itemsToTailor.pull(itemId);
    await tailor.save();
    res.status(200).json({ message: "Item deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getTailorById = async (req, res) => {
  try {
    const tailorId = req.params.id;
    const tailor = await TailorAccount.findById(tailorId);
    if (!tailor) {
      throw new Error("Tailor not found");
    }
    res.status(200).json(tailor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//Tailor now updates the status of an OrderItem Object
//ROUTE PATCH /api/tailors/orderItem/:orderItemId
const updateStatus = async (req, res) => {
  try {
    const orderItemId = req.params.orderItemId;

    const orderItem = await OrderItem.findById(orderItemId);
    if (!orderItem) {
      throw new Error("OrderItem not found");
    }
    console.log("gefunndeses orderItem: ", orderItem);

    const statusFlow = {
      Open: "Processing",
      Processing: "Shipped",
      Shipped: "Done",
      Done: "Done",
    };

    const nextStatus = statusFlow[orderItem.status];
    if (!nextStatus) {
      return res.status(400).json({ error: "Invalid status transition" });
    }

    orderItem.status = nextStatus;
    await orderItem.save();

    if (nextStatus === "Done") {
      const tailor = await TailorAccount.findById(orderItem.tailor);
      tailor.finishedItems.push(orderItem._id);
      tailor.itemsToTailor.pull(orderItem._id);
      await tailor.save();
      await matchLostOrderItemsWithTailor(req, 1);
    }

    console.log("orderItem.order", orderItem.order);

    //check if the order in the which the order item is, gets a new status through the change
    //get the matching order for the order item
    const order = await Order.findById(orderItem.order);

    console.log("order", order);

    // Check the status of all orderItems in the order
    const orderItems = await OrderItem.find({ _id: { $in: order.orderItems } });

    console.log("orderItems", orderItems);

    const statusHierarchy = ["Open", "Processing", "Shipped", "Done"];

    //find the "latest" status (smallest)
    let lowestStatusIndex = statusHierarchy.length;
    console.log("lowestStatusIndex", lowestStatusIndex);
    orderItems.forEach((item) => {
      const statusIndex = statusHierarchy.indexOf(item.status);
      if (statusIndex < lowestStatusIndex) {
        lowestStatusIndex = statusIndex;
      }
    });

    console.log("lowestStatusIndex", lowestStatusIndex);
    console.log(statusHierarchy[lowestStatusIndex]);

    // Update the order status
    order.orderStatus = statusHierarchy[lowestStatusIndex];
    const savedOrder = await order.save();
    console.log("savedOrder", savedOrder);

    res.status(200).json({ message: "Status updated successfully", orderItem });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getCapacity = async (req, res) => {
  try {
    const tailorId = req.params.id;
    const tailor = await TailorAccount.findById(tailorId);
    if (!tailor) {
      throw new Error("Tailor not found");
    }
    res.status(200).json(tailor.capacity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const setCapacity = async (req, newCapacity) => {
  try {
    const tailorId = req.params.id;
    const tailor = await TailorAccount.findById(tailorId);
    if (!tailor) {
      throw new Error("Tailor not found");
    }
    //const { capacity } = req.body;
    tailor.capacity = newCapacity;
    console.log("Jetzt wird gleich gematched");
    await tailor.save();
    await matchLostOrderItemsWithTailor(
      req,
      newCapacity - tailor.itemsToTailor.length
    );

    return tailor.capacity;
  } catch (error) {
    return error.message;
  }
};

const getFinishedItems = async (req, res) => {
  try {
    const tailorId = req.params.id;
    const tailor = await TailorAccount.findById(tailorId);
    if (!tailor) {
      throw new Error("Tailor not found");
    }
    const finishedItems = tailor.finishedItems;
    res.status(200).json(finishedItems);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const addToFinishedItems = async (req, res) => {
  try {
    const tailorId = req.params.id;
    const { finishedItem } = req.body;

    const tailor = await TailorAccount.findById(tailorId);
    if (!tailor) {
      throw new Error("Tailor not found");
    }
    tailor.finishedItems.push(finishedItem);
    await tailor.save();
    res.status(200).json({ message: "Item added to finished items" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getTailorDetails = async (req, res) => {
  try {
    const tailorId = req.params.id;
    const tailor = await TailorAccount.findById(tailorId);
    if (!tailor) {
      throw new Error("Tailor not found");
    }
    res.status(200).json({
      username: tailor.username,
      capacity: tailor.capacity,
      bankInfo: tailor.bankInfo,
      itemsToTailor: tailor.itemsToTailor,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const changeTailorDetails = async (req, res) => {
  try {
    const tailorId = req.params.id;
    const tailor = await TailorAccount.findById(tailorId);
    if (!tailor) {
      throw new Error("Tailor not found");
    }
    console.log(
      "Das ist die response die ChangeTailorDetails bekommt: ",
      req.body
    );
    const { username, capacity, bankInfo } = req.body;
    tailor.username = username;
    // tailor.capacity = capacity; // Muss noch geändert werden
    await setCapacity(req, capacity);
    tailor.bankInfo = bankInfo;
    await tailor.save();
    res.status(200).json({ message: "Tailor details updated" });
  } catch (error) {
    res.status(400).json({
      error: "Failed to change the Tailor Details",
      details: error.message,
    });
  }
};

const getAvailableTailors = async (req, res) => {
  try {
    const availableTailors = await TailorAccount.findAvailableTailors();
    res.status(200).json(availableTailors);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export {
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
  addToFinishedItems,
  getFinishedItems,
  getTailorDetails,
  changeTailorDetails,
  getAvailableTailors,
};
