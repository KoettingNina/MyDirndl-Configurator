import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, Typography, Box, Rating } from "@mui/material";

const ReviewPage = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    axios
      // get all the reviews
      .get(`http://${process.env.REACT_APP_BACKEND_URL}:8080/api/review/`, {
        withCredentials: true,
      })
      .then((response) => {
        setReviews(response.data);
      })
      .catch((error) => console.error("Error fetching reviews:", error));
  }, []);

  // calculate the average of all ratings
  const averageRating =
    reviews.reduce((acc, curr) => acc + curr.starAmount, 0) / reviews.length; // Sum all ratings and divide by number of reviews
  const roundedAverage = Math.round(averageRating * 10) / 10; // Round to one decimal place

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        m: 4,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: 600,
          mb: 1,
        }}
      >
        <Typography
          variant="h5"
          color="primary"
          sx={{
            ml: 1,
            mr: 4,
          }}
        >
          What others think about us
        </Typography>

        <Box
          sx={{
            minWidth: 200,
            textAlign: "center",
          }}
        >
          {/* average rating */}
          <Rating value={averageRating} precision={0.1} readOnly />
          <Typography variant="body2">
            {roundedAverage} of 5 ({reviews.length} Reviews)
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          width: "100%",

          maxWidth: 600,
          maxHeight: 600,
          overflowY: "auto", // Scroll
          padding: 2,
        }}
      >
        {reviews.map((review) => (
          <Card
            key={review._id}
            sx={{
              width: "100%",
              maxWidth: 600,
              mt: 2,
              boxShadow: 3,
            }}
          >
            <CardContent>
              <Typography gutterBottom variant="h7" component="div">
                {review.orderItem.order.customerAccount.firstName}{" "}
                {review.orderItem.order.customerAccount.lastName}
              </Typography>
              <Rating value={review.starAmount} readOnly size="small" />

              <Typography variant="body2" color="text.secondary">
                {review.reviewText}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default ReviewPage;
