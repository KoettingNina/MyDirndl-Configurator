import mongoose from "mongoose";

const colorSchema = mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  price: { type: Number, required: true },
});

const Color = mongoose.model("Color", colorSchema);

export default Color;
