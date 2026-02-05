import mongoose from "mongoose";
import OrderItem from "./orderItemModel.js";

const reviewSchema = new mongoose.Schema(
  {
    reviewText: { type: String, required: true },
    starAmount: { type: Number, required: true },
    orderItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderItem",
      required: true,
    },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
