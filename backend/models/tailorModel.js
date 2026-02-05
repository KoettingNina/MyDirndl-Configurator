import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const tailorAccountSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  },
  password: { type: String, required: true },
  validated: { type: Boolean, required: true },
  capacity: { type: Number, required: true },
  bankInfo: { type: String, required: true },
  itemsToTailor: [{ type: mongoose.Schema.Types.ObjectId, ref: "OrderItem" }],
  finishedItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "OrderItem" }],
});

tailorAccountSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
});

tailorAccountSchema.methods.checkPassword = async function (passwordByTailor) {
  const result = await bcrypt.compare(passwordByTailor, this.password);
  if (result) {
    console.log("Password is correct");
    return true;
  } else {
    console.log("Password is incorrect");
    return false;
  }
};

tailorAccountSchema.statics.findAvailableTailors = async function () {
  const availableTailors = await this.aggregate([
    {
      $match: {
        $expr: {
          $lt: [{ $size: "$itemsToTailor" }, "$capacity"],
        },
      },
    },
  ]).exec();
  return availableTailors;
};

const TailorAccount = mongoose.model("TailorAccount", tailorAccountSchema);

export default TailorAccount;
