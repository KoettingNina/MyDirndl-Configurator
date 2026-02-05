import mongoose from "mongoose";

const skirtSchema = mongoose.Schema({
  color: { type: mongoose.Schema.Types.ObjectId, required: true },
  pattern: { type: mongoose.Schema.Types.ObjectId, required: true },
  //dirndl: { type: mongoose.Schema.Types.ObjectId, required: true }, //Für uns müssen wir nicht unbedingt den Dirndl im Skirt speichern, da wir ja am Ende nur das Dirndl Objekt kreieren und von diesem ablesen
  price: { type: Number, required: true },
});

const Skirt = mongoose.model("Skirt", skirtSchema);

export default Skirt;
