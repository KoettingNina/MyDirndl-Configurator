import mongoose from "mongoose";
//import OrderItem from "./orderItemModel.js";
import CustomerAccount from "./customerModel.js";

const OrderSchema = new mongoose.Schema({
  customerAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CustomerAccount",
    required: true,
  },
  amount: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now },
  orderStatus: { type: String, required: true },
  orderItems: [
    { type: mongoose.Schema.Types.ObjectId, ref: "OrderItem", required: true },
  ],
});

const Order = mongoose.model("Order", OrderSchema);
export default Order;
