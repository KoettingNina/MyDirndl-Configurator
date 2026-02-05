import mongoose from "mongoose";

const inspirationPostSchema = mongoose.Schema({
  orderItemConnection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OrderItem",
    required: true,
  },
  likes: { type: Number, required: false },
  creationDate: { type: Date, required: true },
  wornPicture: { type: String, required: true },
});

const InspirationPost = mongoose.model(
  "InspirationPost",
  inspirationPostSchema
);

export default InspirationPost;
