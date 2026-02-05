import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  Alert,
  Snackbar,
  Container,
  Typography,
  List,
  ListItem,
  Card,
  CardContent,
  CardMedia,
  Box,
  Grid,
  TextField,
  Button,
  Rating,
  Dialog,
  CircularProgress,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import DropzoneComponent from "./DropzoneComponent";

const OrderDetailPage = () => {
  const { orderId } = useParams(); //get orderID from URL parameters
  const [order, setOrder] = useState(null);
  const [reviews, setReviews] = useState({}); // State to store reviews for each order item
  const [ratings, setRatings] = useState({}); // State to store ratings for each order item
  const [loading, setLoading] = useState(true);

  const [inspirationPosts, setInspirationPosts] = useState({}); // State to store inspiration posts for each order item

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // State to manage disabled status of review and dropzone components based on order status
  const [statusDisabled, setStatusDisabled] = useState(false);

  const STATUS = {
    OPEN: "Open",
    IN_PROGRESS: "Processing",
    SHIPPED: "Shipped",
    DONE: "Done",
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(
          `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/order/${orderId}`,
          { withCredentials: true }
        );
        setOrder(response.data); // Set fetched order data to state

        console.log(response.data);

        const initialRatings = {};
        const initialReviews = {};

        // If there exists a review for the order item, set the review and starAmount
        // Otherwise, default starAmount is 5 stars
        response.data.orderItems.forEach((item) => {
          if (item.review) {
            initialReviews[item._id] = item.review.reviewText;
            console.log("item.review.reviewText", item.review.reviewText);

            initialRatings[item._id] = item.review.starAmount;
          } else {
            initialRatings[item._id] = 5; // Default rating
          }
        });
        setReviews(initialReviews);
        setRatings(initialRatings);
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Fetch inspiration posts for each order item
  useEffect(() => {
    const fetchInspirationPosts = async () => {
      try {
        const responses = await Promise.all(
          order.orderItems.map((orderItem) =>
            axios
              .get(
                `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/inspirationPosts/${orderItem._id}`
              )

              .then((response) => response.data)
              .catch((error) => {
                console.error("Error fetching inspiration post:", error);
                return null;
              })
          )
        );

        const posts = {};
        order.orderItems.forEach((orderItem, index) => {
          const responseData = responses[index];
          if (responseData) {
            posts[orderItem._id] = responseData;
          }
        });

        setInspirationPosts(posts);
      } catch (error) {
        console.error("Error fetching inspiration posts:", error);
      }
    };

    fetchInspirationPosts();
  }, [order]);

  //get status of orderItems
  useEffect(() => {
    const newDisabledStates = {};
    if (order && order.orderItems) {
      console.log("order.orderItems", order.orderItems);
      order.orderItems.forEach((item) => {
        newDisabledStates[item._id] =
          item.status === STATUS.IN_PROGRESS || item.status === STATUS.OPEN;
      });
      setStatusDisabled(newDisabledStates);
    }
  }, [order]);

  //handle review text change
  const handleReviewChange = (itemId, event) => {
    setReviews({
      ...reviews,
      [itemId]: event.target.value,
    });
  };

  //posting and updating the review
  const handlePostReview = async (itemId) => {
    try {
      const reviewData = {
        reviewText: reviews[itemId],
        starAmount: ratings[itemId],
      };
      console.log("Posting review:", reviewData);

      // Determine if we need to create a new review or update an existing one
      const method = order.orderItems.find((item) => item._id === itemId).review
        ? "put"
        : "post";

      const url = `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/review/${itemId}/review`;

      //post/put of the review Data
      const response = await axios[method](url, reviewData, {
        withCredentials: true,
      });
      console.log(`Review for item ${itemId}:`, response.data);

      // Update the state of the order items to add the posted or updated review
      setOrder((prevOrder) => ({
        ...prevOrder,
        orderItems: prevOrder.orderItems.map((item) =>
          item._id === itemId ? { ...item, review: response.data } : item
        ),
      }));

      // Show snackbar if  posting/updating was successful
      if (method === "post") {
        setSnackbarMessage("Review successfully posted!");
      } else {
        setSnackbarMessage("Review successfully updated!");
      }
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      //show error snackbar if posting/updating didn't work
      console.error("Error posting review:", error);
      setSnackbarMessage("Error posting review!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleDeleteReview = async (itemId) => {
    try {
      const url = `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/review/${itemId}/review`;
      await axios.delete(url, { withCredentials: true });
      console.log(`Review for item ${itemId} deleted`);

      // Update local state to remove the deleted review
      setReviews({
        ...reviews,
        [itemId]: "",
      });
      setRatings({
        ...ratings,
        [itemId]: 5,
      });

      // Update the state of the order items to remove the deleted review
      setOrder((prevOrder) => ({
        ...prevOrder,
        orderItems: prevOrder.orderItems.map((item) =>
          item._id === itemId ? { ...item, review: null } : item
        ),
      }));

      // show snackbar for successful deletion
      setSnackbarMessage("Review successfully deleted!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error deleting review:", error);
      // Snackbar for error
      setSnackbarMessage("Error deleting review!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  //closing the snackbar if clicking on the X or somewhere on the screen
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  //handle rating change
  const handleRatingChange = (itemId, newValue) => {
    setRatings({
      ...ratings,
      [itemId]: newValue || 5,
    });
  };

  //show loading indicator if data is still missing
  if (loading) {
    return <CircularProgress />;
  }

  //show message if order is not found
  if (!order) {
    return (
      <Container sx={{ mt: "80px", width: 1000 }}>
        <Typography variant="h6">Order not found</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: "80px", width: 1000 }}>
      {/* Information about the complete Order */}
      <Typography variant="h5" gutterBottom color="primary">
        ORDER DETAILS from {new Date(order.orderDate).toLocaleDateString()}
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1">
          Total Price: €{order.amount.toFixed(2)}
        </Typography>
        <Typography variant="body1">Status: {order.orderStatus}</Typography>
      </Box>

      <List>
        {/**iterating over all order items included in the order */}
        {order.orderItems.map((item) => (
          <ListItem key={item._id}>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <Card sx={{ height: "100%" }}>
                  <Box sx={{ display: "flex", width: "100%" }}>
                    {/**image of the dirndl */}
                    {console.log("item.image", item.image)}

                    <CardMedia
                      component="img"
                      sx={{ width: "210px" }}
                      image={`http://${process.env.REACT_APP_BACKEND_URL}:8080${item.dirndl.image}`}
                      alt={item.product}
                    />

                    {/**information about the product: Name, Status*/}
                    <CardContent sx={{ flex: 1 }}>
                      <Typography component="div" variant="h5">
                        {item.product}
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        component="div"
                      >
                        Status: {item.status}
                      </Typography>

                      {/**if the order has the status "In Progress" it is not possible to give a review
                       * -> disables the review textfield, rating and uploading a picture */}

                      {statusDisabled[item._id] && (
                        <Typography
                          variant="body2"
                          color="error"
                          component="div"
                        >
                          A review can only be submitted, once it is shipped.
                        </Typography>
                      )}

                      {/**provide rating betweeen 1-5 - default value is 5 stars */}
                      {/**disabled when not shipped yet -> "in progress" */}
                      <Rating
                        sx={{ mb: 2 }}
                        name={`rating-${item._id}`}
                        disabled={statusDisabled[item._id]}
                        value={ratings[item._id] || 5}
                        onChange={(event, newValue) =>
                          handleRatingChange(item._id, newValue)
                        }
                      />

                      {/**providing a review text */}
                      <TextField
                        label="Review"
                        multiline
                        fullWidth
                        rows={4}
                        value={reviews[item._id] || ""}
                        disabled={statusDisabled[item._id]}
                        onChange={(e) => handleReviewChange(item._id, e)}
                        sx={{ mb: 2 }}
                      />

                      {/**Delete Button Icon only visible if the order item has a review */}
                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        {order.orderItems.find(
                          (orderItem) => orderItem._id === item._id
                        ).review && (
                          <IconButton
                            //deletion of the review
                            onClick={() => handleDeleteReview(item._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}

                        {/* Button for posting/updating the review */}

                        <Button
                          variant="contained"
                          sx={{
                            "&:hover": {
                              backgroundColor: "#6F0A21",
                              opacity: 0.7,
                            },
                          }}
                          onClick={() => handlePostReview(item._id)}
                          // Button is disabled if the review field contains no text
                          disabled={
                            !reviews[item._id] ||
                            reviews[item._id].trim() === ""
                          }
                        >
                          {/* checking if the order item has a review -> change button text accordingly */}
                          {order.orderItems.find(
                            (orderItem) => orderItem._id === item._id
                          ).review
                            ? "Update Review"
                            : "Post Review"}
                        </Button>
                      </Box>
                    </CardContent>
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CardContent>
                    <Box sx={{ mb: 1 }}>
                      {/* dropzone for uploading a picture */}
                      <DropzoneComponent
                        disabled={statusDisabled[item._id]}
                        orderItem={item}
                        existingPost={inspirationPosts[item._id]}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </ListItem>
        ))}
      </List>
      {/* Snackbar for confirming posting/updating/deleting review or error */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OrderDetailPage;
