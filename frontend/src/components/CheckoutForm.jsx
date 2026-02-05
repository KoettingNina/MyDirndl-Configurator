import React, { useEffect, useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {Box, Button, Dialog} from "@mui/material";
import {useCart} from "./ShoppingCart/ShoppingCartProvider";
import axios from "axios";
import { useAuth } from "../authentication/AuthContext";
import { useNavigate } from "react-router-dom";
import {DialogActions, DialogContent, DialogTitle, Typography} from "@mui/material";


/**
 * CheckoutForm component for processing payments.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.clientSecret - The client secret for the payment intent.
 * @returns {JSX.Element} The rendered CheckoutForm component.
 */
export default function CheckoutForm(props) {
  const stripe = useStripe();
  const elements = useElements();
  const { shoppingCart } = useCart();
  const navigate = useNavigate();

    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const {user} = useAuth();
    const [dialog, setDialog] = useState(false);
    const [proceed, setProceed] = useState(false);

    useEffect(() => {
        if (!stripe) {
            console.log("no stripe")
            return;
        }

        const clientSecret = props.clientSecret;

        if (!clientSecret) {
            console.log("no client secret")
            return;
        }

        stripe.retrievePaymentIntent(clientSecret).then(({paymentIntent}) => {
            switch (paymentIntent.status) {
                case "succeeded":
                    setMessage("Payment succeeded!");
                    break;
                case "processing":
                    setMessage("Payment processing...");
                    break;
                case "requires_payment_method":
                    setMessage("Your payment was not successful, please try again");
                    break;
                default:
                    setMessage("An error occurred, please try again");
                    break;
            }
        });
    }, [stripe]);

    // Check if there are available tailors before proceeding with payment
    useEffect(() => {
        if (proceed) {
            handleSubmit();
        }
    }, [proceed]);

    
   
    /**
     * Handles the form submission for the checkout process.
     * @param {Event} event - The form submission event.
     * @returns {Promise<void>} - A promise that resolves when the submission is complete.
     */
    const handleSubmit = async (event) => {
        if(event) event.preventDefault();
        
        // Check if there are available tailors before proceeding with payment
        if (!proceed) {
        try{
            const response = await axios.get(`http://${process.env.REACT_APP_BACKEND_URL}:8080/api/tailors/availableTailors`, {withCredentials: true});
            console.log(response);
            if (response.data.length === 0) {
                return setDialog(true);}
        }
    
        catch (error) {
            console.error("Error fetching tailors:", error);
        }
    }

        console.log("starting payment")
        console.log("elements", elements);
        console.log("stripe", stripe);


        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        // Confirm the payment
        const {error} = await stripe.confirmPayment({
            elements,
            confirmParams: {
                client_secret: props.clientSecret
            },
            redirect: 'if_required',
        });

        // Handle any errors from the payment confirmation
        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message);
            } else {
                setMessage("An unexpected error occurred. "+ error.message);
            }
        } else {
            setMessage("Payment succeeded!");
            navigate("/payment/success");
        }

        // Reset the loading state
        setIsLoading(false);
        // Reset the proceed state
        setProceed(false);
    };

    

    if (Array.isArray(shoppingCart) && shoppingCart.length === 0) {
        return (
            <div>Add items to your ShoppingCart to proceed!</div>
        )
    }

    /**
     * Handles the click event when the confirm button is clicked.
     * 
     * @param {Event} e - The click event object.
     * @returns {void}
     */
    const handleConfirmClick = (e) => {
        e.preventDefault(); 
        setProceed(true); 
        setDialog(false);
    };


  const paymentElementOptions = {
    layout: "tabs",
  };

  if (Array.isArray(shoppingCart) && shoppingCart.length === 0) {
    return <div>Add items to your ShoppingCart to proceed!</div>;
  }

  return (
    <div>
    <form
      id="payment-form"
      onSubmit={handleSubmit}
      style={{ textAlign: "center" }}
    >
      <PaymentElement id="payment-element" options={paymentElementOptions} />
      <Button
        disabled={isLoading || !stripe || !elements}
        type="submit"
        color="primary"
        variant="contained"
        style={{
          backgroundColor: "primary",
          padding: "10px 20px",
          fontSize: "16px",
          borderRadius: "5px",
          border: "none",
          cursor: "pointer",
          transition: "background-color 0.3s ease",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          marginTop: "20px",
        }}
      >
        <span id="button-text">
          {isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}
        </span>
            </Button>
            {/* Show any error or success messages */}
            {/*{message && <div id="payment-message">{message}</div>}*/}

        </form>
            <Dialog open={dialog} onClose={()=>setDialog(false)}>
            <DialogTitle>Tailor Availability</DialogTitle>
            <DialogContent>
            <Typography>
                Are you sure you want to proceed with the payment? There are no tailors available at the moment. The order will be processed as soon as a tailor is available.
            </Typography>
            </DialogContent>
            <DialogActions>
            <Button onClick={()=>setDialog(false)} color="primary">
                Cancel
            </Button>
            <Button
                onClick={(e) => {
                    handleConfirmClick(e);
                }}
                color="primary"
                variant="contained"
            >
                Confirm
            </Button>
            </DialogActions>
        </Dialog>
        </div>
    );
}
