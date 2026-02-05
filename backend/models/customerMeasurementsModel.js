import mongoose from "mongoose";
import CustomerAccount from "./customerModel.js";

const customerMeasurementsSchema = mongoose.Schema(
  {
    customerAccount: { type: mongoose.Schema.Types.ObjectId, required: true },
    height: { type: Number, required: true },
    bustSize: { type: Number, required: true },
    waistSize: { type: Number, required: true },
    hipSize: { type: Number, required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

// unique tuple
customerMeasurementsSchema.index(
  { customerAccount: 1, name: 1 },
  { unique: true }
);

const CustomerMeasurements = mongoose.model(
  "CustomerMeasurements",
  customerMeasurementsSchema
);

export default CustomerMeasurements;
