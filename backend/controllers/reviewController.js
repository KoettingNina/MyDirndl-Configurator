import Review from "../models/reviewModel.js";
import OrderItem from "../models/orderItemModel.js";

// Get all reviews
const getAllReviews = async (req, res) => {
  try {
    //Find all reviews and populate related orderItems, order, and customerAccount fields
    const reviews = await Review.find()
      .populate({
        path: "orderItem",
        populate: {
          path: "order",
          populate: {
            path: "customerAccount",
            select: "username firstName lastName",
          },
        },
      })
      .sort({ starAmount: -1 }); // Sort reviews by star amount in descending order

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Function to add a new review
const addReview = async (req, res) => {
  try {
    //extract reviewText and starAmount from request body
    const { reviewText, starAmount } = req.body;
    const orderItemId = req.params.orderItemId;

    //Find the order item by its ID
    const orderItem = await OrderItem.findById(orderItemId);
    if (!orderItem) {
      return res.status(404).json({ message: "Order item not found" }); // Respond with 404 if order item not found
    }

    // Check if a review already exists for this order item
    if (orderItem.review) {
      return res
        .status(400)
        .json({ message: "Review already exists for this item" }); //respond with 404 if review already exists
    }

    //create a new review
    const review = new Review({
      reviewText,
      starAmount,
      orderItem: orderItemId,
    });
    await review.save(); //save review to database

    //link review to the order item
    orderItem.review = review._id;
    await orderItem.save(); // Save the updated order item

    // Respond with the created review and 201 status code
    res.status(201).json(review);
  } catch (err) {
    // Respond with a 400 status code and error message in case of failure
    res.status(400).json({ message: err.message });
  }
};

// Function to update an existing review
const updateReview = async (req, res) => {
  try {
    // Extract reviewText and starAmount from request body
    const { reviewText, starAmount } = req.body;
    const orderItemId = req.params.orderItemId; // Get order item ID from request parameters

    // Find the order item by its ID and populate the review field
    const orderItem = await OrderItem.findById(orderItemId).populate("review");

    if (!orderItem) {
      return res.status(404).json({ message: "Order item not found" }); // Respond with 404 if order item not found
    }

    if (!orderItem.review) {
      return res.status(404).json({ message: "No review found for this item" }); // Respond with 404 if review not found
    }

    // Update the existing review
    const review = await Review.findById(orderItem.review._id);
    review.reviewText = reviewText;
    review.starAmount = starAmount;
    await review.save(); // Save the updated review to the database

    res.status(200).json(review);
  } catch (err) {
    console.error("Error:", err);
    res.status(400).json({ message: err.message });
  }
};

//function to delete a review
const deleteReview = async (req, res) => {
  try {
    const orderItemId = req.params.orderItemId; // Get order item ID from request parameters

    const orderItem = await OrderItem.findById(orderItemId).populate("review");
    if (!orderItem) {
      return res.status(404).json({ message: "Order item not found" }); // Respond with 404 if order item not found
    }

    if (!orderItem.review) {
      return res.status(404).json({ message: "No review found for this item" }); // Respond with 404 if review not found
    }

    //Delete the review
    await Review.findByIdAndDelete(orderItem.review._id);
    orderItem.review = null; // Remove the reference to the deleted review
    await orderItem.save(); //save the updated order item

    res.status(200).json({ message: "Review deleted" }); // 200 OK
  } catch (err) {
    console.error("Error:", err);
    res.status(400).json({ message: err.message });
  }
};

export { getAllReviews, addReview, updateReview, deleteReview };
