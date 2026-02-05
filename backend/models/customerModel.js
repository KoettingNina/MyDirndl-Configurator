import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const addressSchema = new mongoose.Schema({
  address1: { type: String, required: false },
  address2: { type: String, required: false },
  zip: { type: String, required: false },
  city: { type: String, required: false },
  state: { type: String, required: false },
  country: { type: String, required: false },
  phonePrefix: { type: String, required: false },
  phone: { type: String, required: false },
});

const customerAccountSchema = mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: {
      type: String,
      required: true,
      unique: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },
    password: { type: String, required: true, minlength: 6 },
    paymentMethod: { type: String, required: false },
    deliveryAddress: { type: addressSchema, required: false },
    billingAddress: {
      type: addressSchema,
      required: false /*Frage ist, ob man das ausstellen kann wenn man Haken macht bei: DA ist die selbe wie BA*/,
    },
    favoriteList: [
      { type: mongoose.Schema.Types.ObjectId, ref: "InspirationPost" },
    ],

    savedList: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dirndl" }],
    shoppingCart: [{ type: mongoose.Schema.Types.ObjectId, required: false }],
  },
  { timestamps: true }
);

customerAccountSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
});

customerAccountSchema.methods.checkPassword = async function (passwordByUser) {
  const result = await bcrypt.compare(passwordByUser, this.password);
  if (result) {
    console.log("Password is correct");
    return true;
  } else {
    console.log("Password is incorrect");
    return false;
  }
};

const CustomerAccount = mongoose.model(
  "CustomerAccount",
  customerAccountSchema
);

export default CustomerAccount;
