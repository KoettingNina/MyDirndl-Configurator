import mongoose from "mongoose";

const dirndlSchema = mongoose.Schema({
  Length: { type: String, required: true },
  Neck: { type: String, required: true },
  topColor: { type: String, required: true },
  bottomColor: { type: String, required: true },
  apronColor: { type: String, required: true },
  topPattern: { type: String },
  bottomPattern: { type: String },
  apronPattern: { type: String },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Dirndl = mongoose.model("Dirndl", dirndlSchema);

export default Dirndl;
