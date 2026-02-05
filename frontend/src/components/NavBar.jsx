import {
  AppBar,
  Box,
  Button,
  Toolbar,
  IconButton,
  Container,
  Tooltip,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, AccountCircle } from "@mui/icons-material";
import React, { useState } from "react";
import { useAuth } from "../authentication/AuthContext";
import LogOutPopUp from "./LogOutPopUp";
import logo from "../images/MyDirndl.png";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import ShoppingCartDrawer from "./ShoppingCart/ShoppingCartDrawer";
import { useEffect } from "react";
import { useCart } from "./ShoppingCart/ShoppingCartProvider";
import { Badge } from "@mui/material";

import { set } from "mongoose";

/**
 * Renders the navigation bar component.
 *
 * @returns {JSX.Element} The navigation bar component.
 */
function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, tailor, logout, logoutTailor } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [shoppingOpen, setShoppingOpen] = React.useState(false);
  const { shoppingCart, setShoppingCart, totalItems, remoteUpdate, itemCount } =
    useCart();
  const [logOutSuccess, setLogOutSuccess] = useState(false);
  const [logOutFail, setLogOutFail] = useState(false);
  const [CartOnPaymentPage, setCartOnPaymentPage] = useState(false);

  useEffect(() => {
    try {
      if (user) {
        (async () => {
          var remoteItems = [];
          remoteItems = await fetchCartItems();
          console.log("remoteItems", remoteItems);

          var diff = [];
          if (
            Array.isArray(shoppingCart) &&
            shoppingCart.length > remoteItems.length
          ) {
            diff = shoppingCart.filter(
              (item1) => !remoteItems.some((item2) => item1.id === item2.id)
            );
          }
          console.log("Diff local to remote: " + diff.length);
          // if (diff.length > 0) {
          //   for (let i = 0; i < diff.length; i++) {
          //     axios.post(
          //       `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/customers/shoppingCart/${user}`,
          //       {
          //         data: diff[i].id,
          //       },
          //       { withCredentials: true }
          //     );
          //   }
          //   setShoppingCart(await fetchCartItems());
          // } else
          if (
            Array.isArray(shoppingCart) &&
            shoppingCart.length === remoteItems.length
          ) {
            console.log("No change in cartItems");
          } else {
            setShoppingCart(remoteItems);
          }
        })();
      } else {
        console.log("Ich erkenne keinen user", user);
      }
    } catch (error) {
      console.log(error.response);
    }
  }, [shoppingCart, user, isOpen, remoteUpdate]);

  /**
   * Fetches the cart items for a user.
   * @returns {Promise<Array>} A promise that resolves to an array of enriched cart items.
   */
  const fetchCartItems = async () => {
    var shoppingCart = [];

    // Get the shopping cart items
    await axios
      .get(
        `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/customers/shoppingCart/${user}`,
        { withCredentials: true }
      )
      .then((res) => {
        shoppingCart = res.data;
        console.log(shoppingCart);
      })
      .catch((err) => {
        console.log(err);
      });
    console.log(shoppingCart.length);
    try {
      // Promises for the order items
      const orderItemPromises = shoppingCart.map((item) =>
        axios.get(
          `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/orderItem/item/${item}`,
          { withCredentials: true }
        )
      );
      // Wait for all order items to be fetched
      const orderItemsResponses = await Promise.all(orderItemPromises);
      const enrichedItemsPromises = orderItemsResponses.map(
        async (response) => {
          const sitem = response.data.orderItem;
          const dirndlPromise = axios.get(
            `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/dirndl/get/${sitem.dirndl}`,
            { withCredentials: true }
          );
          const customerMeasurementPromise = axios.get(
            `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/customerMeasurements/get/${sitem.customerMeasurement}`,
            { withCredentials: true }
          );

          // Wait for both promises to resolve
          const [dirndlResponse, customerMeasurementResponse] =
            await Promise.all([dirndlPromise, customerMeasurementPromise]);

          // Enrich the shopping cart item with the dirndl and customer measurement
          sitem.dirndl = dirndlResponse.data;
          sitem.customerMeasurement =
            customerMeasurementResponse.data.measurement;

          return sitem;
        }
      );

      // Wait for all items to be enriched
      const enrichedItems = await Promise.all(enrichedItemsPromises);

      return enrichedItems; // Return the enriched items
    } catch (error) {
      console.error(error);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  /**
   * Handles the logout functionality.
   * @async
   * @function handleLogout
   * @returns {Promise<void>}
   */
  const handleLogout = async () => {
    setLogOutSuccess(false);
    setLogOutFail(false);

    try {
      let result;
      if (tailor) {
        result = await logoutTailor();
      } else {
        result = await logout();
      }

      if (result) {
        setLogOutSuccess(true);

        navigate("/");
      } else {
        setLogOutFail(true);
      }

      setIsOpen(false);
    } catch (error) {
      console.error("Logout failed", error);
      setLogOutFail(true);
    }
    setIsOpen(false);
    setShoppingCart([]);
    navigate("/");
  };

  const handleLogoutClick = () => {
    setIsOpen(true);
    handleClose();
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const navigateLogin = () => {
    navigate("/login");
    setAnchorEl(null);
  };

  const navigateRegister = () => {
    navigate("/register");
    setAnchorEl(null);
  };

  const navigateCustomerSettings = () => {
    navigate("/customersettings");
    setAnchorEl(null);
  };

  const navigateOrders = () => {
    navigate("/order");
    setAnchorEl(null);
  };

  const navigateSaved = () => {
    navigate("/saved");
    setAnchorEl(null);
  };

  const navigateTailorSettings = () => {
    navigate("/tailorsettings");
    setAnchorEl(null);
  };

  /**
   * Handles the shopping cart functionality.
   * If the user is logged in, fetches the cart items and adds them to the shopping cart state.
   * Sets the shopping cart open state based on the current location pathname.
   * Sets the cart on payment page state if the current location pathname is "/payment".
   */
  const handleShoppingCart = async () => {
    if (user) {
      const cart = await fetchCartItems();
      for (let i = 0; i < cart.length; i++) {
        const sitem = cart[i];
        if (!shoppingCart.find((item) => item.id === sitem.id)) {
          setShoppingCart([...shoppingCart, sitem]);
        }
      }
      if (location.pathname !== "/payment") {
        setShoppingOpen(true);
      } else {
        setCartOnPaymentPage(true);
      }
    }
  };

  return (
    <AppBar position="sticky" color="white" elevation={0}>
      <Container>
        <Toolbar disableGutters style={{ position: "relative" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              width: "33.33%",
            }}
          >
            {tailor ? (
              <>
                <Link to="/tailorhome">
                  <Button
                    color="darkred"
                    className={`${
                      location.pathname === "/tailorhome" ? "active" : ""
                    }`}
                  >
                    Home
                  </Button>
                </Link>
                <Link to="/tailorItems">
                  <Button
                    color="darkred"
                    className={`${
                      location.pathname === "/tailorItems" ? "active" : ""
                    }`}
                  >
                    My Orders
                  </Button>
                </Link>
                <Link to="/itemsFinished">
                  <Button
                    color="darkred"
                    className={`${
                      location.pathname === "/itemsFinished" ? "active" : ""
                    }`}
                  >
                    My Dirndl
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/">
                  <Button
                    color="darkred"
                    className={`${location.pathname === "/" ? "active" : ""}`}
                  >
                    Home
                  </Button>
                </Link>
                <Link to="/configuration">
                  <Button
                    color="darkred"
                    className={`${
                      location.pathname === "/configuration" ? "active" : ""
                    }`}
                  >
                    Configuration
                  </Button>
                </Link>
                <Link to="/inspiration">
                  <Button
                    color="darkred"
                    className={`${
                      location.pathname === "/inspiration" ? "active" : ""
                    }`}
                  >
                    Inspiration
                  </Button>
                </Link>
              </>
            )}
          </Box>
          <Box
            sx={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              top: 0,
            }}
          >
            <img src={logo} alt="Logo" style={{ height: "130px" }} />
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              flexGrow: 1,
            }}
          >
            {(user || tailor) && (
              <Typography
                variant="body1"
                color="primary"
                sx={{ marginRight: "20px", alignSelf: "center" }}
              >
                Welcome!
              </Typography>
            )}
            {!tailor && (
              <IconButton color="darkred">
                <Badge badgeContent={itemCount} color="primary">
                  <ShoppingCart onClick={handleShoppingCart} />
                </Badge>
              </IconButton>
            )}

            <Tooltip
              title={user || tailor ? "Settings/Logout" : "Login/Register"}
            >
              <IconButton color="darkred" onClick={handleMenu}>
                <AccountCircle />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              {user || tailor ? (
                <div>
                  {tailor ? (
                    <MenuItem onClick={navigateTailorSettings}>
                      Profile
                    </MenuItem>
                  ) : (
                    <div>
                      <MenuItem onClick={navigateCustomerSettings}>
                        Profile
                      </MenuItem>
                      <MenuItem onClick={navigateOrders}>Orders</MenuItem>
                      <MenuItem onClick={navigateSaved}>
                        Saved & Favorites
                      </MenuItem>
                    </div>
                  )}
                  <MenuItem onClick={handleLogoutClick}>Log out</MenuItem>
                </div>
              ) : (
                <div>
                  <MenuItem onClick={navigateLogin}>Login</MenuItem>
                  <MenuItem onClick={navigateRegister}>Register</MenuItem>
                </div>
              )}
            </Menu>
          </Box>
        </Toolbar>
        <LogOutPopUp
          isOpen={isOpen}
          handleLogout={handleLogout}
          handleClose={() => {
            setIsOpen(false);
          }}
        />
        <ShoppingCartDrawer
          drawopen={shoppingOpen}
          closeDrawer={() => {
            setShoppingOpen(false);
          }}
          cartItems={shoppingCart}
          setCartItems={setShoppingCart}
          total={totalItems}
          setDrawopen={setShoppingOpen}
        />
        {CartOnPaymentPage ? (
          <Snackbar
            open={CartOnPaymentPage}
            autoHideDuration={3000}
            onClose={() => setCartOnPaymentPage(false)}
          >
            <Alert onClose={() => setCartOnPaymentPage(false)} severity="error">
              Leave the Payment Page to view and edit your Shopping Cart!
            </Alert>
          </Snackbar>
        ) : null}
        {logOutSuccess ? (
          <Snackbar
            open={logOutSuccess}
            autoHideDuration={3000}
            onClose={() => setLogOutSuccess(false)}
          >
            <Alert onClose={() => setLogOutSuccess(false)} severity="success">
              User Logged Out!
            </Alert>
          </Snackbar>
        ) : null}

        {logOutFail ? (
          <Snackbar
            open={logOutFail}
            autoHideDuration={3000}
            onClose={() => setLogOutFail(false)}
          >
            <Alert onClose={() => setLogOutFail(false)} severity="error">
              User Logout Failed!
            </Alert>
          </Snackbar>
        ) : null}
      </Container>
    </AppBar>
  );
}
export default NavBar;
