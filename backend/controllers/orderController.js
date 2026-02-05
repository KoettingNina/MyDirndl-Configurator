import Order from "../models/orderModel.js";
import CustomerAccount from "../models/customerModel.js";
import Dirndl from "../models/dirndlModel.js";
import mongoose from "mongoose";

//GET /api/order/:customerId/orders
// Get all orders for a customer by username
const getOrdersByCustomerId = async (req, res) => {
  try {
    //find the customer account by username
    const customer = await CustomerAccount.findById(req.params.customerId);
    // If the customer is not found, respond with a 404 status code and message
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Find all orders associated with the customer's account
    const orders = await Order.find({ customerAccount: customer._id }).populate(
      "orderItems"
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//GET /api/order/:orderId
// Get a specific order by order ID
const getOrderById = async (req, res) => {
  try {
    // Find the order by ID and populate the order items and customer account
    const order = await Order.findById(req.params.orderId)
      .populate({
        path: "orderItems",
        populate: [
          {
            path: "review",
            model: "Review",
          },
          {
            path: "dirndl",
            model: "Dirndl",
          },
        ],
      })
      .populate({
        path: "customerAccount",
        select: "firstName lastName deliveryAddress",
        model: "CustomerAccount",
      });

    // If the order is not found, respond with a 404 status code and message
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const customerId = req.params.Id;
    const { orderItems, total } = req.body;

    const customer = await CustomerAccount.findById(customerId);

    if (!customer) {
      throw new Error("Customer not found");
    }
    orderItems.forEach((element) => {
      if (!mongoose.Types.ObjectId.isValid(element._id)) {
        return res.status(400).send("Invalid ObjectID");
      }
    });

    const newOrder = await Order.create({
      customerAccount: customer._id,
      orderItems: orderItems,
      amount: total,
      orderStatus: "Open",
    });

    console.log(newOrder);

    res.status(201).json({
      _id: newOrder._id,
      customerAccount: newOrder.customerAccount,
      orderItems: newOrder.orderItems,
      amount: newOrder.amount,
      orderStatus: newOrder.orderStatus,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const findOrderItem = async (req, res) => {
  try {
    //const {orderItemId} = req.params;
    console.log("Request is:", req.params);
    const orderItemId = req.params.orderId;
    if (!orderItemId) {
      orderItemId = req.params.orderItemId;
    }
    console.log(`Received orderItemId: ${orderItemId}`);

    // Fetch all orders and populate their orderItems
    const orders = await Order.find().populate("orderItems");
    console.log(`Fetched ${orders.length} orders from the database.`);

    let foundOrderItem = null;
    let foundOrder = null;

    // Iterate over the orders to find the order item
    for (const order of orders) {
      foundOrderItem = order.orderItems.find((orderItem) => {
        const orderItemIdString = orderItem._id.toString();
        return orderItemIdString === orderItemId;
      });
      if (foundOrderItem) {
        foundOrder = order;
        break;
      }
    }

    if (foundOrderItem) {
      res.json({ order: foundOrder, orderItem: foundOrderItem._id });
    } else {
      res.status(404).json({ message: "Order item not found" });
    }
  } catch (err) {
    console.error("Error occurred while finding order item:", err);
    res.status(500).json({ message: err.message });
  }
};

export { getOrdersByCustomerId, getOrderById, createOrder, findOrderItem };
