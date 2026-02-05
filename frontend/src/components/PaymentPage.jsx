import React, {useEffect, useState} from "react";
import {Elements} from "@stripe/react-stripe-js";
import {loadStripe} from "@stripe/stripe-js";
import CheckoutForm from "./CheckoutForm.jsx";
import {Box, Grid} from "@mui/material";
import { useCart } from "./ShoppingCart/ShoppingCartProvider";
import CartItem from "./ShoppingCart/CartItem";
import { useTheme } from '@mui/material/styles';
import axios from "axios";
import { useAuth } from "../authentication/AuthContext";
import { Shop } from "@mui/icons-material";
import ShoppingCart from "./ShoppingCart/ShoppingCart";
import { margin } from "@mui/system";


// Initialize Stripe with our publishable key
const stripePromise = loadStripe(
    "pk_test_51PNZ2DRu6DVunuhshlzs4eeNXgSmzg3fWR3Urs92E9hvVGVuiJ8PoVHUAXCbqcjHW4TcPMKAUIE2LOLXABdpZ85900SAQfHzl1"
);

// TODO
// - Add warenkorb komponente
// - after payment: create order
// - store orderId in all orderItems of that payment

const PaymentPage = () => {
  const { shoppingCart, setShoppingCart, totalItems} = useCart();
  const theme = useTheme();
  const { user } = useAuth();
  const [success, setSuccess] = useState(false);

    // Initialize state variable for client secret
    const [clientSecret, setClientSecret] = useState("");

    const order = [{price: totalItems*100}]

    // Use useEffect hook to fetch client secret when component is first rendered
    useEffect(() => {
        console.log(order);
        // Send POST request to backend to create PaymentIntent and get client secret
        fetch(`http://${process.env.REACT_APP_BACKEND_URL}:8080/payment`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            withCredentials: true,
            body: JSON.stringify({items: order}),
        })
            .then((res) => res.json())
            .then((data) => {
                // Set client secret in state
                if (data.clientSecret) {
                    setClientSecret(data.clientSecret);
                } else {
                    console.error("Client secret not received:", data);
                }
            })
            .catch((error) => {
                console.error("Error fetching client secret:", error);
            });
    }, []);

  return (
    <Box
      className="App"
      style={{ display: "flex", alignItems: "center", marginTop: "100px" }}
    >
      <Grid container spacing={2}
        alignItems={"center"}
        justifyContent={"center"}>
      <Grid item xs={12} sm={6} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <ShoppingCart cartItems={shoppingCart} setCartItems={setShoppingCart} total={totalItems} checkout={true}/>
      </Grid>
      <Grid item xs={12} sm={6}>
      {clientSecret && (
        <Box style={{ flex:"60%",marginRight:"20%", marginTop: "200px", width: "100%", maxWidth: "500px" }}>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm />
          </Elements>
        </Box>
      )}
      </Grid>
      </Grid>
    </Box>
  );
};

export default PaymentPage;
