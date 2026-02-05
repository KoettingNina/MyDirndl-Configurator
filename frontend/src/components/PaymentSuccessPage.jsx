import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { styled } from "@mui/system";
import BackgroundImage from "../images/paymentSuccessful.webp";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";
import { useCart } from "./ShoppingCart/ShoppingCartProvider";
import { useAuth } from "../authentication/AuthContext";
import { set } from "mongoose";
import { useState } from "react";

const PaymentSuccessPage = () => {
  const { shoppingCart, setShoppingCart, totalItems, setRemoteUpdate } =
    useCart();
  const { user } = useAuth();

  // when rending the page the backend needs to handle the update of the orderItems
  useEffect(() => {
    handleSuccesfullPayment();
  }, []);

  const handleSuccesfullPayment = async () => {
    try {
      // retrieve the item ids from the shopping cart that has been paid
      const items = shoppingCart.map((item) => ({ _id: item._id }));
      console.log("handlesuccess");
      // create the order consisting of the total amount and the orderItemIds from the shopping cart
      const response = await axios.post(
        `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/order/${user}`,
        {
          total: totalItems,
          orderItems: items,
        },
        { withCredentials: true }
      );

      console.log("response:", response);

      if (response.status === 201) {
        // update the status of the orderItems to paid
        const updateItemStatusPromises = shoppingCart.map((item) => 
          axios.post(
            `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/orderItem/statusPaid/${item._id}`,
            {},
            { withCredentials: true }
          )
        );

        // Update the orderItems with the order id
        const updateItemOrderPromises = shoppingCart.map((item) => 
          axios.post(
            `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/orderItem/order/${response.data._id}`,
            {
              orderItemId: item._id,
            },
            { withCredentials: true }
          )
        );

        // Empty the shopping cart
        await axios.delete(
          `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/customers/shoppingCart/empty/${user}`,
          { withCredentials: true }
        );
        setShoppingCart([]);
        // Ensure all item updates are complete before proceeding

        updateDB();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // signal the shopping cart to update
  const updateDB = () => {
    // id this is set to true the shopping cart will update
    setRemoteUpdate(true);
    setTimeout(() => {
      setRemoteUpdate(false);
    }, 6000);
  };

  const PageContainer = styled(Box)({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    height: "100vh",
    backgroundImage: `url(${BackgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    padding: 20,
  });

  const SuccessMessage = styled(Box)({
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    padding: "40px 20px",
    borderRadius: 8,
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    maxWidth: 500,
    width: "100%",
    backdropFilter: "blur(10px)",
  });

  const StyledButton = styled(Button)({
    backgroundColor: "primary",
    color: "white",
    marginTop: 20,
    "&:hover": {
      backgroundColor: "primary",
    },
  });

  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/");
  };

  return (
    <PageContainer>
      <SuccessMessage>
        <Typography variant="h1" component="h2" gutterBottom color="primary">
          Payment Successful!
        </Typography>
        <Typography variant="h4" gutterBottom color="primary">
          Thank you for your purchase!
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Your custom Dirndl will be with you shortly.
        </Typography>

        <StyledButton variant="contained" onClick={handleClick}>
          Back to Home
        </StyledButton>
      </SuccessMessage>
    </PageContainer>
  );
};

export default PaymentSuccessPage;
