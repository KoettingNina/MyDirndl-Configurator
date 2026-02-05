import mongoose from "mongoose";

const patternSchema = mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  price: { type: Number, required: true },
});

const Pattern = mongoose.model("Pattern", patternSchema);

export default Pattern;
