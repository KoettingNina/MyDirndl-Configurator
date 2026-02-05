import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Link,
  CircularProgress,
} from "@mui/material";

import { useAuth } from "../authentication/AuthContext";
import { useNavigate } from "react-router-dom";

const OrderOverview = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const customerId = user;

  const navigate = useNavigate();

  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        //get all orders that belong to the user
        const response = await axios.get(
          `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/order/${customerId}/orders`,
          { withCredentials: true }
        );
        setOrders(response.data); //Set fetched orders to state
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false); //set loading to false after fetch
      }
    };

    fetchOrders();
  }, [customerId]);

  // Show loading indicator if data is still being fetched
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Handle click on order link to navigate to order detail page
  const handleClick = (orderId) => {
    navigate(`/order/${orderId}`); // Navigate to the order detail page
  };

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        padding: 2,
        mt: "80px",
      }}
    >
      <Typography variant="h5" gutterBottom color="primary">
        YOUR ORDERS
      </Typography>
      <List>
        {/* shows all orders from the logged-in user */}
        {orders.map((order) => (
          <ListItem key={order._id}>
            <ListItemText
              primary={
                <Link onClick={() => handleClick(order._id)} underline="hover">
                  Order on {new Date(order.orderDate).toLocaleDateString()}
                </Link>
              }
              secondary={`Total Price: €${order.amount.toFixed(2)} - Status: ${
                order.orderStatus
              }`}
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default OrderOverview;
