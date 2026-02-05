import mongoose from "mongoose";

const bodiceSchema = mongoose.Schema({
  color: { type: mongoose.Schema.Types.ObjectId, required: true },
  pattern: { type: mongoose.Schema.Types.ObjectId, required: true },
  //dirndl: { type: mongoose.Schema.Types.ObjectId, required: false },
  price: { type: Number, required: true },
});

const Bodice = mongoose.model("Bodice", bodiceSchema);

export default Bodice;
