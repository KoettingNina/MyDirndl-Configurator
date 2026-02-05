import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import path from "path";
import { fileURLToPath } from "url";

import customerRoutes from "./routes/customerRoutes.js";
import tailorRoutes from "./routes/tailorRoutes.js";

import reviewRoutes from "./routes/reviewRoutes.js";

import measurementRoutes from "./routes/measurementRoutes.js";
import inspirationPostRoutes from "./routes/inspirationPostRoutes.js";
import dirndlRoutes from "./routes/dirndlRoutes.js";

import orderRoutes from "./routes/orderRoutes.js";
import orderItemRoutes from "./routes/orderItemRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

import { checkAuth } from "./middlewares/authMiddleware.js";

////
import CustomerAccount from "./models/customerModel.js";
import Order from "./models/orderModel.js";
import OrderItem from "./models/orderItemModel.js";
import Review from "./models/reviewModel.js";

////
import 'dotenv/config';

////
import { Stripe } from "stripe";
////

dotenv.config();

const corsOptions = {
  origin: "http://localhost:3000", // or your frontend domain
  credentials: true, // critical for cookies to be sent and received
  exposedHeaders: ["Set-Cookie"],
};

const port = 8080;

const app = express();

//Middlewares
app.use(cors(corsOptions));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));
app.use(cookieParser());

//Our different Routes
app.use("/api/customers", customerRoutes);
app.use("/api/tailors", tailorRoutes);

app.use("/api/review", reviewRoutes);

app.use("/api/customerMeasurements", measurementRoutes);
app.use("/api/inspirationPosts", inspirationPostRoutes);
app.use("/api/dirndl", dirndlRoutes);

app.use("/api/order", orderRoutes);

app.use("/api/orderItem", orderItemRoutes);

app.use("/api/payment", paymentRoutes);

app.get("/api/check-auth", checkAuth, (req, res) => {
  console.log("check-auth in backend", req.user);
  res.json({ user: req.user });
});

// //upload from dirndls
// const upload = multer();

// app.post("/api/upload", upload.single("image"), async (req, res) => {
//   try {
//     const { buffer } = req.file;

//     const fileName = `image-${Date.now()}.jpeg`;
//     const filePath = path.join(__dirname, "uploads", fileName);

//     fs.writeFileSync(filePath, buffer);

//     res.status(200).json({ imagePath: `/uploads/${fileName}` });
//   } catch (error) {
//     res.status(500).json({
//       error: "Bildverarbeitung fehlgeschlagen",
//       details: error.message,
//     });
//   }
// });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static file route for uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Hello World from backend");
});

//Connection to Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(express.static("public"));
const calculateOrderAmount = (items) => {
  let totalAmount = 0;

  for (let item of items) {
    totalAmount += item.price;
  }

  return totalAmount;
};

app.post("/payment", async (req, res) => {
  const { items } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(items),
      currency: "eur",
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating payment intent");
  }
});

//Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server listening on ${port}`);
    });
  })
  .catch((error) => {
    console.error(error);
  });
