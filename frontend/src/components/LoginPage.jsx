import React, { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../authentication/AuthContext";
import Login from "./Login";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { Snackbar } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Alert from "@mui/material/Alert";
// import { handleLoginSuccess } from "./ConfigurationStepper";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginTailor } = useAuth();
  const [success, setSuccess] = React.useState(false);
  const theme = useTheme();

  const [error, setError] = useState(""); //to set an error message if login not successful
  const [tabValue, setTabValue] = React.useState(
    location.state?.tabValue || "customer"
  );

  /**
   * Handles the form submission for the login page.
   *
   * @param {Event} event - The form submission event.
   * @returns {Promise<void>} - A promise that resolves when the login process is complete.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const transmit = {
      username: data.get("email").toLowerCase(),
      password: data.get("password"),
    };
    console.log(transmit);

    setError(""); // Reset error before new attempt
    try {
      const result = await login(transmit);
      console.log("result", result);

      //checks whether the login was successful
      if (result.success) {
        handleShowSnackbar();
        console.log("Login successful");

        // get the unsaved Configuration from the local Storage
        const unsavedConfig = JSON.parse(localStorage.getItem("unsavedConfig"));

        const unsavedMeasurements = JSON.parse(
          localStorage.getItem("unsavedMeasurements")
        );

        // get the customerId from the token
        const response = await axios({
          method: "GET",
          url: `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/check-auth`,
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });
        //const user = await CustomerAccount.findById(verifiedToken.userId);
        const customerId = response.data.user._id;
        console.log("retrieved customerId", customerId);
        console.log("result", result);

        // if there are unsaved configurations, save them
        if (unsavedMeasurements) {
          const savedMeasurement = await saveMeasurement(
            unsavedMeasurements,
            customerId
          );
          unsavedMeasurements._id = savedMeasurement._id;
        }

        if (unsavedConfig || unsavedMeasurements) {
          // Navigate to the configuration stepper page with the unsavedConfig and unsavedMeasurements
          navigate("/configuration", {
            state: {
              unsavedConfig,
              unsavedMeasurements: unsavedMeasurements
                ? { ...unsavedMeasurements, customerAccount: customerId }
                : null,
              step: unsavedMeasurements ? 3 : 2,
            },
            replace: true,
          });
          console.log("LoginPage unsavedMeasurements", unsavedMeasurements);

          if (unsavedConfig) localStorage.removeItem("unsavedConfig");
          if (unsavedMeasurements)
            localStorage.removeItem("unsavedMeasurements");
        } else {
          // otherwise just normal login
          navigate("/", { replace: true });
        }
      } else {
        setError(result.message); // setError
      }
    } catch (error) {
      console.error("Unexpected error during login: ", error);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  // Check if the measurement already exists
  const checkMeasurementExists = async (measurement) => {
    try {
      const response = await axios.post(
        `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/customerMeasurements/check`,
        {
          customerAccount: measurement.customerAccount,
          name: measurement.name,
        },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error("Error checking measurement existence:", error);
      throw error;
    }
  };

  /**
   * Saves a measurement for a given user.
   *
   * @param {Object} measurement - The measurement object to be saved.
   * @param {string} userId - The ID of the user associated with the measurement.
   * @returns {Promise<Object>} - A promise that resolves to the saved measurement object.
   * @throws {Error} - If there is an error saving the measurement.
   */
  const saveMeasurement = async (measurement, userId) => {
    try {
      measurement.customerAccount = userId;
      const checkResponse = await checkMeasurementExists(measurement);

      console.log("checkResponse", checkResponse.exists);

      if (checkResponse.exists) {
        console.log("Measurement already exists:", checkResponse.measurement);
        return checkResponse.measurement;
      } else {
        const response = await axios.post(
          `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/customerMeasurements/create`,
          measurement,
          { withCredentials: true }
        );
        if (response.status === 201) {
          console.log("Measurement saved successfully:", response.data);
          return response.data;
        } else {
          console.error("Failed to save measurement:", response);
          throw new Error("Failed to save measurement");
        }
      }
    } catch (error) {
      console.error("Error saving measurement:", error);
      throw error;
    }
  };

  /**
   * Handles the submission of the login form for the Tailor login.
   *
   * @param {Event} event - The form submission event.
   * @returns {Promise<void>} - A promise that resolves when the login process is complete.
   */
  const handleTailorSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const transmit = {
      username: data.get("email").toLowerCase(),
      password: data.get("password"),
    };
    console.log(transmit);

    setError(""); // Reset error before new attempt
    try {
      const result = await loginTailor(transmit);
      if (result.success) {
        handleShowSnackbarTailor();
        console.log("Tailor Login successful");
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error("Unexpected error during login: ", error);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  /**
   * Handles showing the snackbar.
   */
  const handleShowSnackbar = () => {
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
    }, 500);
  };

  /**
   * Handles showing the snackbar for the tailor and navigates to the tailor home page after a delay.
   */
  const handleShowSnackbarTailor = () => {
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      navigate("/tailorhome");
    }, 500); // Snackbar will disappear after 3 seconds
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Tabs
          onChange={handleTabChange}
          value={tabValue}
          exclusive
          indicatorColor="primary"
          textColor="primary"
          sx={{ marginTop: 2, width: "100%" }}
        >
          <Tab label="Customer" value="customer" sx={{ width: "50%" }}>
            Customer
          </Tab>
          <Tab label="Tailor" value="tailor" sx={{ width: "50%" }}>
            Tailor
          </Tab>
        </Tabs>
        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
        {tabValue === "customer" ? (
          <Login handleSubmit={handleSubmit} />
        ) : (
          <Login handleSubmit={handleTailorSubmit} />
        )}
      </Box>
      {success && (
        <Snackbar
          open={success}
          autoHideDuration={3000}
          onClose={() => setSuccess(false)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <Alert onClose={() => setSuccess(false)} severity="success">
            Login successful!
          </Alert>
        </Snackbar>
      )}
    </Container>
  );
}
