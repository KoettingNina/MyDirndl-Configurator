import React from "react";
import Drawer from "@mui/material/Drawer";
import ShoppingCart from "./ShoppingCart";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../authentication/AuthContext";
import axios from "axios";

/**
 * Represents a shopping cart drawer component.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {boolean} props.drawopen - Indicates whether the drawer is open or not.
 * @param {Function} props.closeDrawer - The function to close the drawer.
 * @param {Array} props.cartItems - The array of cart items.
 * @param {Function} props.setCartItems - The function to set the cart items.
 * @param {number} props.total - The total price of the items in the cart.
 * @param {Function} props.setDrawopen - The function to set the drawer open state.
 * @returns {JSX.Element} The ShoppingCartDrawer component.
 */
const ShoppingCartDrawer = ({
  drawopen,
  closeDrawer,
  cartItems,
  setCartItems,
  total,
  setDrawopen,
}) => {
  const anchor = "right";
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { user } = useAuth();

  /**
   * Handles the checkout process.
   * Navigates to the "/payment" route and closes the drawer.
   */
  const handleCheckout = () => {
    navigate("/payment");
    closeDrawer();
  };

  
  /**
   * Performs a check on the user details, if no address is saved in the user account the check returns false.
   * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether the check passed or not.
   */
  const performCheck = async () => {
    console.log("Wir fetchen jz die User Details in PerformCheck");
    const userData = await axios({
      method: "GET",
      url: `http://localhost:8080/api/customers/userDetails/${user}`,
      withCredentials: true,
    });
    console.log("user data", userData.data);
    if (
      userData.data.deliveryAddress.address1 === "" ||
      userData.data.deliveryAddress.city === "" ||
      userData.data.deliveryAddress.zip === "" ||
      userData.data.deliveryAddress.country === ""
    ) {
      console.log("Check nicht bestanden");
      return false;
    } else {
      console.log("Check beszanden. Sollte addresse haben");
      return true;
    }
  };

  const showAddressRequiredDialog = () => {
    setDialogOpen(true);
  };
  /**
   * Closes the dialog and sets the draw open state to false.
   */
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDrawopen(false);
  };

  const previousBehavior = () => {
    handleCheckout();
  };

  /**
   * Handles the click event for the button.
   * Performs a check and shows a dialog if the check fails.
   * Calls the previous behavior if the check passes.
   * @returns {Promise<void>} A promise that resolves when the click event is handled.
   */
  const handleClick = async () => {
    const result = await performCheck();
    if (!result) {
      console.log("Check nicht bestanden");
      showAddressRequiredDialog();
    } else {
      console.log("Check bestanden");
      previousBehavior();
    }
  };

  return (
    <Drawer
      anchor={anchor}
      open={drawopen}
      onClose={closeDrawer}
      sx={{
        "& .MuiDrawer-paper": {
          borderTopLeftRadius: "16px",
          borderBottomLeftRadius: "16px",
        },
      }}
    >
      <ShoppingCart
        cartItems={cartItems}
        setCartItems={setCartItems}
        total={total}
      />
      <Button
        variant="contained"
        color="primary"
        sx={{ margin: "20px" }}
        onClick={handleClick}
      >
        Checkout
      </Button>
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Address Required</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            You cannot add proceed to checkout without an address in your
            profile. Please update your profile with an address.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
          <Button
            onClick={() => {
              handleCloseDialog();
              navigate("/customersettings");
            }}
            color="primary"
            variant="contained"
          >
            Go to Profile Settings
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
};
export default ShoppingCartDrawer;
