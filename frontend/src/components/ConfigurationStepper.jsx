import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Step,
  StepLabel,
  Stepper,
  Typography,
  Snackbar,
  Alert,
  SnackbarContent,
} from "@mui/material";
import "./StepperStyle.css";
import Length from "./Configurator/Length";
import Neckline from "./Configurator/Neckline";
import Colour from "./Configurator/Colour";
import Measurements from "./Configurator/Measurements";
import axios from "axios";
import { useLocation } from "react-router-dom";
import {
  basePrice,
  necklinePrices,
  lengthPrices,
  colorOptions,
  patterns,
} from "./Configurator/data";
import { useNavigate } from "react-router-dom";
import { Canvg } from "canvg";
import { renderToStaticMarkup } from "react-dom/server";
import {
  SvgComponent,
  getSchablone,
  getKnoepfe,
} from "./Configurator/Colour.jsx";

import { useAuth } from "../authentication/AuthContext.js";
import { useCart } from "./ShoppingCart/ShoppingCartProvider.jsx";
import { set } from "mongoose";

export default function HorizontalLabelPositionBelowStepper() {
  const location = useLocation();

  // Hook to manage the current step index in the stepper
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = ["Length", "Neckline", "Colour", "Measurements"];

  // Hook to manage the dirndl configuration state
  const [config, setConfig] = React.useState({
    Length: "",
    Neck: "",
    topColor: "",
    bottomColor: "",
    apronColor: "",
    topPattern: "",
    bottomPattern: "",
    apronPattern: "",
  });

  // Hooks for various states
  const [price, setPrice] = useState(basePrice);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isConfigComplete, setIsConfigComplete] = useState(false);
  const [unsavedMeasurement, setUnsavedMeasurement] = useState(null);

  // State to check if the address check has passed
  const [checkPassed, setCheckPassed] = useState(false);

  const { user } = useAuth();
  const customerId = user;

  const { shoppingCart, setShoppingCart, remoteUpdate, setRemoteUpdate } =
    useCart();

  // Handle-functions for Next and Back Button
  const handleStepChange = (newStep) => {
    setActiveStep(newStep); // Update the current step index
    const currentState = location.state || {};
    navigate("/configuration", {
      state: {
        ...location.state,
        step: newStep,
        design: currentState.design,
      },
      replace: true,
    });
  };

  // Handles updating the configuration state when user makes a selection
  const handleUpdate = (event) => {
    const { name, value } = event.target;
    setConfig((prevConfig) => ({
      ...prevConfig,
      [name]: value,
    }));

    updatePrice({ ...config, [name]: value }); // Update the price based on the new configuration
  };

  // Sets the configuration state directly and updates the price (pass to component Color)
  const handleSetConfig = (name, value) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      [name]: value,
    }));
    updatePrice({ ...config, [name]: value });
  };

  const [v, selectV] = React.useState(false);
  const [box, selectBox] = React.useState(false);

  // Handles selection of V-neck
  function handleSelectV() {
    selectV(true);
    selectBox(false);

    handleUpdate({ target: { name: "Neck", value: "v-neck" } });
  }

  // Handles selection of Box-neck
  function handleSelectBox() {
    selectV(false);
    selectBox(true);
    handleUpdate({ target: { name: "Neck", value: "box-neck" } });
  }

  const [long, selectLong] = React.useState(false);
  const [midi, selectMidi] = React.useState(false);

  // Handles selection of Long length
  function handleSelectLong() {
    selectLong(true);
    selectMidi(false);
    handleUpdate({ target: { name: "Length", value: "Long" } });
  }

  // Handles selection of Midi length
  function handleSelectMidi() {
    selectLong(false);
    selectMidi(true);
    handleUpdate({ target: { name: "Length", value: "Midi" } });
  }

  // stores the currently selected measurements for the user
  const [selected, setSelected] = React.useState("");

  //only able to click next if long/midi or v-neck/boxline was selected
  const isNextDisabled = () => {
    if (activeStep === 0) return !long && !midi;
    if (activeStep === 1) return !v && !box;
    return false;
  };

  useEffect(() => {
    if (location.state) {
      const { design, step, unsavedConfig, unsavedMeasurements } =
        location.state;

      console.log("design", design);
      console.log("step", step);
      console.log("unsavedConfig", unsavedConfig);
      console.log("unsavedMeasurements", unsavedMeasurements);
      const isMeasurementsComplete =
        unsavedMeasurements &&
        unsavedMeasurements.name &&
        unsavedMeasurements.bustSize &&
        unsavedMeasurements.waistSize &&
        unsavedMeasurements.hipSize &&
        unsavedMeasurements.height &&
        unsavedMeasurements.customerAccount;

      if (isMeasurementsComplete) {
        setUnsavedMeasurement(unsavedMeasurements);
        setConfig(unsavedConfig);
        setSelected(unsavedMeasurements);

        if (unsavedConfig.Length === "Long") {
          selectLong(true);
          selectMidi(false);
        } else {
          selectLong(false);
          selectMidi(true);
        }

        if (unsavedConfig.Neck === "v-neck") {
          selectV(true);
          selectBox(false);
        } else {
          selectV(false);
          selectBox(true);
        }

        setActiveStep(step === 3 ? 3 : 2);
      } else if (unsavedConfig) {
        console.log("location.state.unsavedConfig", unsavedConfig);
        setConfig(unsavedConfig);

        if (unsavedConfig.Length === "Long") {
          selectLong(true);
          selectMidi(false);
        } else {
          selectLong(false);
          selectMidi(true);
        }

        if (unsavedConfig.Neck === "v-neck") {
          selectV(true);
          selectBox(false);
        } else {
          selectV(false);
          selectBox(true);
        }

        //only setConfig if step is 2
        if (step === 2) {
          setIsConfigComplete(true);
          navigate("/configuration", {
            state: {
              ...location.state,
              unsavedMeasurements: null,
              unsavedConfig: null,
              step: 2,
            },
            replace: true,
          });
        }

        setActiveStep(step === 2 ? 2 : 3);
      } else if (design) {
        setConfig({
          Length: design.Length,
          Neck: design.Neck,
          topColor: design.topColor,
          bottomColor: design.bottomColor,
          apronColor: design.apronColor,
          topPattern: design.topPattern,
          bottomPattern: design.bottomPattern,
          apronPattern: design.apronPattern,
        });

        if (design.Length === "Long") {
          selectLong(true);
          selectMidi(false);
        } else {
          selectLong(false);
          selectMidi(true);
        }
        if (design.Neck === "v-neck") {
          selectV(true);
          selectBox(false);
        } else {
          selectV(false);
          selectBox(true);
        }

        setActiveStep(step);
      }
      console.log(config);
    }
  }, [location.state]);

  useEffect(() => {
    if (isConfigComplete) {
      handleSave();
    }
  }, [isConfigComplete]);

  useEffect(() => {
    if (unsavedMeasurement && setSelected) {
      setSelected(unsavedMeasurement);
    }
  }, [unsavedMeasurement, setSelected]);

  useEffect(() => {
    updatePrice(config);
  }, [config]);

  // Function to update the price based on the configuration
  const updatePrice = (name, value) => {
    let newPrice = basePrice;

    // Add prices for length and neckline
    if (config.Length) {
      newPrice += lengthPrices[config.Length];
    }
    if (config.Neck) {
      newPrice += necklinePrices[config.Neck];
    }

    // Add prices for colors and patterns
    const colorPatternPrices = {
      topColor:
        colorOptions.find(
          (option) =>
            option.color === (name === "topColor" ? value : config.topColor)
        )?.price || 0,
      bottomColor:
        colorOptions.find(
          (option) =>
            option.color ===
            (name === "bottomColor" ? value : config.bottomColor)
        )?.price || 0,
      apronColor:
        colorOptions.find(
          (option) =>
            option.color === (name === "apronColor" ? value : config.apronColor)
        )?.price || 0,
      topPattern:
        patterns.find(
          (pattern) =>
            pattern.src === (name === "topPattern" ? value : config.topPattern)
        )?.price || 0,
      bottomPattern:
        patterns.find(
          (pattern) =>
            pattern.src ===
            (name === "bottomPattern" ? value : config.bottomPattern)
        )?.price || 0,
      apronPattern:
        patterns.find(
          (pattern) =>
            pattern.src ===
            (name === "apronPattern" ? value : config.apronPattern)
        )?.price || 0,
    };

    newPrice += Object.values(colorPatternPrices).reduce((a, b) => a + b, 0);
    setPrice(newPrice);
  };

  const { token } = useAuth();

  // Function to handle saving the dirndl configuration
  const handleSave = async (isForCart) => {
    if (!config || !config.Length || !config.Neck) {
      console.error("Config is empty or incomplete:", config);
      return;
    }
    // Convert the SVG to a data URL
    const svgDataUrl = await svgToBase64(
      <SvgComponent
        config={config}
        topColor={config.topColor}
        bottomColor={config.bottomColor}
        apronColor={config.apronColor}
        topPattern={config.topPattern}
        bottomPattern={config.bottomPattern}
        apronPattern={config.apronPattern}
      />
    );

    // Create an image element for the SVG
    const svgImage = new Image();
    svgImage.src = svgDataUrl;

    // Create image elements for the Dirndl and KnopfSchablone
    const dirndlImage = new Image();
    dirndlImage.src = getSchablone(config);

    const knopfImage = new Image();
    knopfImage.src = getKnoepfe(config);

    // Wait for all images to load
    await Promise.all([
      new Promise((resolve) => (svgImage.onload = resolve)),
      new Promise((resolve) => (dirndlImage.onload = resolve)),
      new Promise((resolve) => (knopfImage.onload = resolve)),
    ]);

    // Create a canvas to combine the images
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");

    // Draw the SVG image onto the canvas
    ctx.drawImage(svgImage, 0, 0, 500, 500);

    // Draw the Dirndl image onto the canvas
    ctx.drawImage(dirndlImage, 0, 0, 500, 500);

    // Draw the KnopfSchablone image onto the canvas
    ctx.drawImage(knopfImage, 0, 0, 500, 500);

    // Convert the combined canvas to a data URL
    const finalDataUrl = canvas.toDataURL("image/png");

    // Convert Canvas to Blob
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("image", blob, "dirndl.png");

      formData.append("Length", config.Length);
      formData.append("Neck", config.Neck);
      formData.append("topColor", config.topColor);
      formData.append("bottomColor", config.bottomColor);
      formData.append("apronColor", config.apronColor);
      formData.append("topPattern", config.topPattern);
      formData.append("bottomPattern", config.bottomPattern);
      formData.append("apronPattern", config.apronPattern);
      formData.append("price", price);

      try {
        const response = await axios.post(
          `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/dirndl/upload`,

          formData,

          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          }
        );

        const dirndlId = response.data._id;

        if (isForCart) {
          handleAddToCart(dirndlId);
        } else {
          saveFavorite(customerId, dirndlId); // save the dirndl in the customer account (add to favoriteList)
        }

        setImagePreview(response.data.image); // set the image preview
      } catch (error) {
        console.error("Fehler beim Hochladen des Bildes:", error);
      }
    }, "image/png");
  };

  // Function to save the dirndl to the favorites
  const saveFavorite = async (customerId, dirndlId) => {
    console.log("saveFavorite customerid, dirndlId", customerId, dirndlId);
    try {
      const response = await axios.post(
        `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/customers/addSaved/${customerId}`,
        { dirndlId: dirndlId },
        {
          withCredentials: true,
        }
      );

      setSnackbarMessage("Dirndl saved in your account!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      console.log("Saved List: ", response.data);
    } catch (error) {
      setSnackbarMessage("Dirndl could not be saved!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      console.error("Error saving favorite:", error);
    }
  };

  // Function to convert SVG to base64
  const svgToBase64 = async (svgElement) => {
    const svgString = renderToStaticMarkup(svgElement);
    const canvas = document.createElement("canvas");
    canvas.width = 1400;
    canvas.height = 1400;
    const ctx = canvas.getContext("2d");
    const v = Canvg.fromString(ctx, svgString);
    await v.render();
    return canvas.toDataURL("image/png");
  };

  const [addCartPopUpOpen, setAddCartPopUpOpen] = React.useState(false);

  // Function to handle adding the dirndl to the cart
  const handleAddToCart = async (dirndlId) => {
    const orderItemId = await createOrderItemAndGetId(dirndlId);
    //await addToShoppingCartOfCustomerObject(customerId, orderItemId);
    setAddCartPopUpOpen(true);
  };

  // Function to create an order item and get its ID
  const createOrderItemAndGetId = async (dirndlId) => {
    // Create the order item with the Dirndl ID
    const orderItem = {
      product: "Dirndl",
      status: "Open",
      dirndl: dirndlId,
      customerMeasurement: selected._id,
    };

    if (user) {
      try {
        const response = await axios.post(
          `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/orderItem/create`,
          orderItem,
          { withCredentials: true }
        );

        console.log(response);
        if (response.status === 201) {
          const id = response.data._id;
          await axios.post(
            `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/customers/shoppingCart/${user}`,
            { shoppingCartItemID: id },
            { withCredentials: true }
          );
          updateDB();
          setAddCartPopUpOpen(true);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      addToLocalCart(orderItem);
      setAddCartPopUpOpen(true);
    }
  };

  // Function to update the database
  const updateDB = () => {
    setRemoteUpdate(true);
    setTimeout(() => {
      setRemoteUpdate(false);
    }, 6000);
  };

  // Function to add an item to the customer's shopping cart
  const addToShoppingCartOfCustomerObject = async (
    customerId,
    shoppingCartItemID
  ) => {
    try {
      const response = await axios.post(
        `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/customers/shoppingCart/${customerId}`,
        { shoppingCartItemID },
        { withCredentials: true }
      );

      if (response.status === 200 || response.status === 201) {
        console.log("Item added to shopping list successfully");
      }
    } catch (error) {
      console.error("Error adding item to shopping list:", error);
    }
  };

  const handleCloseAddCart = () => {
    setAddCartPopUpOpen(false);
  };

  // Function to add an item to the local shopping cart
  const addToLocalCart = (item) => {
    const localCart = JSON.parse(localStorage.getItem("shoppingCart"));
    if (localCart === null) {
      localStorage.setItem("shoppingCart", JSON.stringify([item]));
    } else {
      localCart.push(JSON.stringify(item));
    }
  };

  const navigate = useNavigate();

  // Function to handle designing more items
  const handleDesignMore = () => {
    // Close the pop up
    setAddCartPopUpOpen(false);
    // Reset all selection state variables
    selectV(false);
    selectBox(false);
    selectLong(false);
    selectMidi(false);
    setSelected("");

    // Reset the configuration
    setConfig({
      Length: "",
      Neck: "",
      topColor: "",
      bottomColor: "",
      apronColor: "",
      topPattern: "",
      bottomPattern: "",
      apronPattern: "",
      Measure: "",
    });
    setPrice(basePrice);
    // Navigate to the first step
    setActiveStep(0);
  };

  const handleGoToCheckout = () => {
    setAddCartPopUpOpen(false);
    navigate("/payment");
  };

  //Lennarts Add Ons
  const [dialogOpen, setDialogOpen] = useState(false);

  // Function to perform the address check
  const performCheck = async () => {
    const userData = await axios({
      method: "GET",
      url: `http://localhost:8080/api/customers/userDetails/${customerId}`,
      withCredentials: true,
    });
    if (
      userData.data.deliveryAddress.address1 === "" ||
      userData.data.deliveryAddress.city === "" ||
      userData.data.deliveryAddress.zip === "" ||
      userData.data.deliveryAddress.country === ""
    ) {
      setCheckPassed(false);
      return false;
    } else {
      setCheckPassed(true);
      return true;
    }
  };

  const showAddressRequiredDialog = () => {
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const previousBehavior = () => {
    handleGoToCheckout();
  };

  // Handles the click event to perform the address check
  const handleClick = async () => {
    const result = await performCheck();
    if (!result) {
      showAddressRequiredDialog();
      handleCloseAddCart();
    } else {
      previousBehavior();
    }
  };

  return (
    <div className="root">
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={label} onClick={() => handleStepChange(index)}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <div className="content">
        <div>
          <div className="instructions">
            {activeStep === 0 && (
              <Length
                handleUpdate={handleUpdate}
                handleLong={handleSelectLong}
                handleMidi={handleSelectMidi}
                long={long}
                midi={midi}
              />
            )}
            {activeStep === 1 && (
              <Neckline
                handleUpdate={handleUpdate}
                handleBox={handleSelectBox}
                handleV={handleSelectV}
                box={box}
                v={v}
              />
            )}
            {activeStep === 2 && (
              <Colour
                config={config}
                price={price}
                handleSetConfig={handleSetConfig}
                handleSave={handleSave}
              />
            )}
            {activeStep === 3 && (
              <Measurements
                selected={selected}
                setSelected={setSelected}
                config={config}
                setUnsavedMeasurements={setUnsavedMeasurement}
              />
            )}
          </div>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              paddingRight: "20px",
              mr: "70px",
            }}
          >
            <Typography variant="h6" color="primary">
              Total Price: {price}€
            </Typography>
          </Box>

          {activeStep === steps.length - 1 && selected === "" && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                paddingRight: "20px",
                mr: "70px",
              }}
            >
              <Typography
                variant="body1"
                color="error"
                sx={{ textAlign: "center", marginBottom: "10px" }}
              >
                You need to save your measurements to continue
              </Typography>
            </Box>
          )}

          <div className="buttonsContainer">
            <Button
              disabled={activeStep === 0}
              onClick={() => handleStepChange(activeStep - 1)}
              className="backButton"
              sx={{ mr: 0.5 }}
            >
              Back
            </Button>
            {activeStep !== steps.length - 1 ? (
              <Button
                className="nextButton"
                variant="contained"
                color="primary"
                onClick={() => handleStepChange(activeStep + 1)}
                disabled={isNextDisabled()}
              >
                Next
              </Button>
            ) : (
              <Button
                className="nextButton"
                variant="contained"
                color="primary"
                onClick={() => handleSave(true)}
                disabled={selected === ""}
              >
                Add to Cart
              </Button>
            )}
            {/* Dialog for missing address */}
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

            <Dialog open={addCartPopUpOpen} onClose={handleCloseAddCart}>
              <DialogTitle>{"Added to Cart"}</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Your item has been added to the cart. Do you want to keep
                  designing or proceed to checkout?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleDesignMore}>Design more</Button>
                <Button
                  //onClick={handleGoToCheckout}
                  onClick={() => handleClick()}
                  variant="contained"
                  color="primary"
                >
                  Proceed to Checkout
                </Button>
              </DialogActions>
            </Dialog>

            <Snackbar
              open={snackbarOpen}
              autoHideDuration={3000}
              onClose={() => setSnackbarOpen(false)}
            >
              <SnackbarContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "100%",
                }}
                message={
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    {imagePreview && (
                      <img
                        src={`http://${process.env.REACT_APP_BACKEND_URL}:8080${imagePreview}`}
                        alt="Dirndl Preview"
                        style={{
                          width: "60px",
                          height: "60px",
                          marginBottom: "10px",
                        }}
                      />
                    )}
                    <Alert
                      onClose={() => setSnackbarOpen(false)}
                      severity={snackbarSeverity}
                      sx={{ width: "100%" }}
                    >
                      {snackbarMessage}
                    </Alert>
                  </Box>
                }
              />
            </Snackbar>
          </div>
        </div>
      </div>
    </div>
  );
}
