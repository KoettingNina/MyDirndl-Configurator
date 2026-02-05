import CartItem from "./CartItem";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "../../authentication/AuthContext";
import axios from "axios";
import { Box, Grid, Snackbar, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { fontSize } from "@mui/system";
import { useCart } from "./ShoppingCartProvider";

/**
 * Represents a shopping cart component.
 *
 * @param {Object} props - The component props.
 * @param {Array} props.cartItems - The items in the shopping cart.
 * @param {Function} props.setCartItems - The function to update the items in the shopping cart.
 * @param {number} props.total - The total price of the items in the shopping cart.
 * @param {Function} props.checkout - The function to initiate the checkout process.
 * @returns {JSX.Element} The ShoppingCart component.
 */
const ShoppingCart = ({ cartItems, setCartItems, total, checkout }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [alertVisible, setalertVisible] = useState(false);
  const { setRemoteUpdate } = useCart();

  /**
   * Handles showing the snackbar if Item is deleted from ShoppinCart.
   */
  const handleShowSnackbar = () => {
    setalertVisible(true);
    setTimeout(() => {
      setalertVisible(false);
    }, 3000);
  };

  /**
   * useEffect to ensure re-rendering of the component when cartItems or total change.
   **/
  useEffect(() => {
    console.log("cartItems oder total hat sich geändert");
  }, [cartItems, total]);

  /**
   * Handles the removal of an item from the cart.
   * @param {string} id - The ID of the item to be removed.
   */
  const handleRemoveFromCart = async (id) => {
    cartItems.forEach(async (item) => {
      if (item._id === id) {
        console.log("inside if");
        await handleRemoveRemoteFromCart(item);
        updateDB();
        await handleCleanUpOrderItems(item);
        console.log("dirndlid remove", item.dirndl._id);
        await handleDeleteDirndl(item.dirndl._id);

        handleShowSnackbar();
      }
    });
  };

  const updateDB = () => {
    setRemoteUpdate(true);
    setTimeout(() => {
      setRemoteUpdate(false);
    }, 6000);
  };

  /**
   * Handles the cleanup of order items.
   * @param {Object} item - The item to be cleaned up in the database to avoid orphaned data.
   * @returns {Promise<void>} - A promise that resolves when the cleanup is complete.
   */
  const handleCleanUpOrderItems = async (item) => {
    const id = item._id;
    const res = await axios({
      method: "DELETE",
      url: `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/orderItem/item/${id}`,
      withCredentials: true,
    });
    console.log(res);
  };

  const handleDeleteDirndl = async (designToDeleteId) => {
    const res = await axios.delete(
      `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/dirndl/delete/${designToDeleteId}`,
      { withCredentials: true }
    );
    console.log(res);
  };

  /**
   * Removes an item from the shopping cart on the remote server.
   * @param {Object} item - The item to be removed from the shopping cart.
   * @returns {Promise} - A promise that resolves with the response from the server.
   */
  const handleRemoveRemoteFromCart = async (item) => {
    const res = await axios({
      method: "DELETE",
      url: `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/customers/shoppingCart/${user}`,
      withCredentials: true,
      data: { shoppingCartItem: item },
    });
    console.log("handleREmove", res);
    //await handleCleanUpOrderItems(item);
  };

  return (
    <Box
      sx={{
        width: 350, // oder die gewünschte Breite des Drawers
        display: "flex",
        flexDirection: "column",
        justifyContent: "center", // Zentriert den Inhalt vertikal
        alignItems: "center", // Zentriert den Inhalt horizontal
        textAlign: "center", // Stellt sicher, dass der Text zentriert ist, falls er mehrere Zeilen umfasst
      }}
    >
      <h2
        style={{
          color: theme.palette.primary.main,
          paddingLeft: "10px",
          paddingRight: "10px",
          justifyContent: "center",
        }}
      >
        Your shopping cart
      </h2>
      <Box
        sx={{
          width: "100%",
          maxHeight: "calc(100vh - 200px)", // Anpassen basierend auf der tatsächlichen Höhe der anderen Elemente
          overflowY: "auto",
        }}
      >
        {Array.isArray(cartItems) && cartItems.length === 0 ? (
          <p style={{ paddingLeft: "10px", paddingRight: "10px" }}>
            No items in cart.
          </p>
        ) : null}
        {Array.isArray(cartItems) &&
          cartItems.map((item) => (
            <Box sx={{ width: "100%", mb: 2 }}>
              <CartItem
                key={item._id}
                item={item}
                style={{
                  color: theme.palette.primary.main,
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  fontSize: "0.875rem",
                }}
                handleRemoveFromCart={() => handleRemoveFromCart(item._id)}
                checkout={checkout}
              />
            </Box>
          ))}
      </Box>
      <h3
        style={{
          color: theme.palette.primary.main,
          paddingLeft: "10px",
          paddingRight: "10px",
        }}
      >
        Total: {total} €
      </h3>
      {alertVisible && (
        <Snackbar
          open={alertVisible}
          autoHideDuration={3000}
          message="Item removed from cart."
          duration={3000}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          ContentProps={{
            style: {
              backgroundColor: "white",
              color: theme.palette.primary.main,
            },
          }}
          onClose={() => setalertVisible(false)}
        />
      )}
    </Box>
  );
};
export default ShoppingCart;
