import OrderItem from "../models/orderItemModel.js";
import TailorAccount from "../models/tailorModel.js";
import mongoose from "mongoose";

const createOrderItem = async (req, res) => {
  try {
    const {
      product,
      status,
      dirndl,
      customerMeasurement,
      assignedToTailor,
      statusPaid,
    } = req.body;

    const newOrderItem = await OrderItem.create({
      product,
      status,
      dirndl,
      customerMeasurement,
      assignedToTailor,
      statusPaid,
    });

    res.status(201).json({
      message: "OrderItem created successfully",
      _id: newOrderItem._id,
      product: newOrderItem.product,
      status: newOrderItem.status,
      //order: newOrderItem.order,
      dirndl: newOrderItem.dirndl,
      customerMeasurement: newOrderItem.customerMeasurement,
      statusPaid: newOrderItem.statusPaid,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const matchLostOrderItemsWithTailor = async (req, availableSpots) => {
  try {
    const orderItemsNotMatchedWithTailor =
      await OrderItem.findOrderItemsNotMatchedWithTailor();
    if (orderItemsNotMatchedWithTailor.length > 0) {
      for (let i = 0; i < orderItemsNotMatchedWithTailor.length; i++) {
        // Check if the item needs to be matched (statusPaid is true)
        if (orderItemsNotMatchedWithTailor[i].statusPaid === true) {
          // Exit early if no available spots left
          if (availableSpots <= 0) {
            break;
          }

          console.log(
            "Matching sollte passieren mit: ",
            orderItemsNotMatchedWithTailor[i]
          );

          // Perform the matching asynchronously
          const result = await matchOrderItemWithTailor(
            req,
            orderItemsNotMatchedWithTailor[i]
          );

          // Decrement available spots after matching
          availableSpots--;

          // Check if matching was unsuccessful
          if (result === "No tailor available") {
            return "No tailor available for some order items";
          }
        }
      }
    }
    return "All lost order items matched with tailors";
  } catch (error) {
    return error.message;
  }
};

const matchOrderItemWithTailor = async (req, orderItem) => {
  try {
    const availableTailors = await TailorAccount.findAvailableTailors(
      orderItem
    );
    console.log("Available tailors in matching: ", availableTailors);

    if (availableTailors.length > 0) {
      let minItemsToTailor = availableTailors[0].itemsToTailor.length;
      let tailorIndex = 0;

      for (let i = 1; i < availableTailors.length; i++) {
        if (availableTailors[i].itemsToTailor.length < minItemsToTailor) {
          minItemsToTailor = availableTailors[i].itemsToTailor.length;
          tailorIndex = i;
        }
      }

      const tailorWithLeastItems = availableTailors[tailorIndex];
      const isPaid = orderItem.statusPaid;
      if (isPaid) {
        await OrderItem.updateOne(
          { _id: orderItem._id },
          { $set: { tailor: tailorWithLeastItems._id } }
        );
        await TailorAccount.updateOne(
          { _id: tailorWithLeastItems._id },
          {
            $push: { itemsToTailor: orderItem._id },
          }
        );
        const changeResult = await changeAssignedToTailor(req, orderItem._id);
        return changeResult;
      }
    } else {
      return "No tailor available";
    }
  } catch (error) {
    return error.message;
  }
};

//ROUTE GET api/orderItem/status/:id
const getStatus = async (req, res) => {
  try {
    const { id } = req.params; // Extract the id from the route parameters
    const orderItem = await OrderItem.findById(id);

    if (!orderItem) {
      return res
        .status(404)
        .json({ error: "OrderItem not found in getStatus" });
    }

    res.status(200).json({ status: orderItem.status });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//ROUTE GET api/orderItem/item/:id
const getOrderItem = async (req, res) => {
  try {
    const { id } = req.params; // Extract the id from the route parameters
    const orderItem = await OrderItem.findById(id);

    if (!orderItem) {
      return res
        .status(404)
        .json({ error: "OrderItem not found in getOrderItem" });
    }

    return res.status(200).json({ orderItem });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//ROUTE PUT api/orderItem/statusPaid/:id
const changeStatusPaid = async (req, res) => {
  try {
    const id = req.params.id;
    const orderItem = await OrderItem.findById(id);

    if (!orderItem) {
      return res
        .status(404)
        .json({ error: "OrderItem not found in changeStatusPaid" });
    }
    if (!orderItem.statusPaid) {
      await OrderItem.updateOne({ _id: id }, { $set: { statusPaid: true } });

      const newOrderItem = await OrderItem.findById(id);
      const matchResult = await matchOrderItemWithTailor(req, newOrderItem);
      if (matchResult !== "No tailor available" && !res.headersSent) {
        res.status(200).json({ message: "OrderItem statusPaid changed" });
      }
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(400).json({ error: error.message });
    }
  }
};

const changeAssignedToTailor = async (req, orderItemId) => {
  try {
    const id = new mongoose.Types.ObjectId(orderItemId);
    const orderItemFound = await OrderItem.findById(id);

    if (!orderItemFound) {
      return "OrderItem not found in changeAssignedToTailor";
    }

    await OrderItem.updateOne(
      { _id: id },
      { $set: { assignedToTailor: true } }
    );
    return "OrderItem assignedToTailor changed";
  } catch (error) {
    return error.message;
  }
};

const deleteOrderItem = async (req, res) => {
  try {
    const id = req.params.id;
    await OrderItem.deleteOne({ _id: id });

    res.status(200).json({ message: "OrderItem deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { orderItemId } = req.body;

    const orderItem = await OrderItem.findById(orderItemId);

    if (!orderItem) {
      return res
        .status(404)
        .json({ error: "OrderItem not found in changeOrder" });
    }

    orderItem.order = orderId;
    await orderItem.save();

    res.status(200).json({ message: "OrderItem order changed" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export {
  createOrderItem,
  getStatus,
  getOrderItem,
  changeStatusPaid,
  changeAssignedToTailor,
  matchOrderItemWithTailor,
  matchLostOrderItemsWithTailor,
  deleteOrderItem,
  updateOrder,
};
