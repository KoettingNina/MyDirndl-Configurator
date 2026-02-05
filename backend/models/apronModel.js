import mongoose from "mongoose";

const apronSchema = mongoose.Schema({
  color: { type: mongoose.Schema.Types.ObjectId, required: true },
  pattern: { type: mongoose.Schema.Types.ObjectId, required: true },
  //dirndl: { type: mongoose.Schema.Types.ObjectId, required: false },
  price: { type: Number, required: true },
});

const Apron = mongoose.model("Apron", apronSchema);

export default Apron;
