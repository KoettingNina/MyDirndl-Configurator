import mongoose from "mongoose";
import Order from "./orderModel.js";
import Review from "./reviewModel.js";

const OrderItemSchema = new mongoose.Schema({
  //TODO ändern zu dirndl
  product: { type: String, required: true },
  customerMeasurement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CustomerMeasurement",
    required: false,
  },

  dirndl: { type: mongoose.Schema.Types.ObjectId, ref: "Dirndl" },
  //   inspirationPost: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "InspirationPost",
  //   },
  status: {
    type: String,
    required: true,
    enum: ["Open", "Processing", "Shipped", "Done"],
    default: "Open",
  },
  image: { type: String, required: false },
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Review",
    required: false,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: false,
  },
  tailor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TailorAccount",
    required: false,
  },
  statusPaid: { type: Boolean, required: true, default: false },
  assignedToTailor: { type: Boolean, required: true, default: false },
});

OrderItemSchema.statics.findOrderItemsNotMatchedWithTailor = async function () {
  const orderItemsNotMatchedWithTailor = await this.find({
    assignedToTailor: false,
  });
  return orderItemsNotMatchedWithTailor;
};

const OrderItem = mongoose.model("OrderItem", OrderItemSchema);
export default OrderItem;
