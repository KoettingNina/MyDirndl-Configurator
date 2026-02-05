import mongoose from "mongoose";

const dirndlBluseSchema = mongoose.Schema({
  color: { type: mongoose.Schema.Types.ObjectId, required: true },
  pattern: { type: mongoose.Schema.Types.ObjectId, required: true },
  //dirndl: { type: mongoose.Schema.Types.ObjectId, required: false },
  price: { type: Number, required: true },
});

const DirndlBluse = mongoose.model("DirndlBluse", dirndlBluseSchema);

export default DirndlBluse;
