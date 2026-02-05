import * as React from "react";
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
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../authentication/AuthContext";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CustomerRegisterForm from "./CustomerRegisterForm";
import TailorRegisterForm from "./TailorRegisterForm";
import { Snackbar } from "@mui/material";
import Alert from "@mui/material/Alert";
import { set } from "mongoose";

export default function RegisterPage() {
  const [checked, setChecked] = useState(false);

  const [checkedT, setCheckedT] = useState("customer");

  const { register, tailorRegister } = useAuth();
  const [success, setSuccess] = useState(false);

  const [openS, setOpenS] = useState(false);
  const [openF, setOpenF] = useState(false);

  //to set error if input is wrong
  const [errors, setErrors] = useState({});

  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    phonePrefix: "",
    phone: "",
  });

  const [tailorFormData, setTailorFormData] = useState({
    username: "",
    password: "",
    capacity: "",
    currentCapacity: "",
    bankInfo: "",
  });

  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleChangeT = (key, value) => {
    setTailorFormData({ ...tailorFormData, [key]: value });
  };

  const handleCheckboxChange = (event) => {
    setChecked(event.target.checked);
  };
  const handleCheckboxChangeT = (event, newSelect) => {
    setCheckedT(newSelect);
    console.log(newSelect);
  };

  /**
   * Handles the form submission for the registration page.
   *
   * @param {Event} event - The form submission event.
   * @returns {Promise<void>} - A promise that resolves when the form submission is complete.
   */
  const handleSubmit = async (event) => {
    setSuccess(false); //reset success state

    event.preventDefault();

    // Check if Tailor is selected
    if (checkedT === "tailor") {
      // retrieve the data from the form
      const transmit = {
        username: tailorFormData.username.toLowerCase(),
        password: tailorFormData.password,
        capacity: tailorFormData.capacity,
        currentCapacity: tailorFormData.capacity,
        bankInfo: tailorFormData.bankInfo,
        validated: false,
      };

      console.log(transmit);
      try {
        // send the data to the backend
        const res = await tailorRegister(transmit);
        if (res.status === 201) {
          setSuccess(true);
          handleShowSnackbar(true);
          console.log("Tailor Registration successful");
        } else {
          setSuccess(false);
          handleShowSnackbar(false);
          console.log("Tailor Registration failed");
        }
      } catch (error) {
        setSuccess(false);
        handleShowSnackbar(false);
        console.error("Registration failed", error);
        if (error.response?.data?.error) {
          setErrorMessage(error.response.data.error);
        } else {
          setErrorMessage("An unexpected error occurred. Please try again.");
        }
      }
    } else {
      // retrieve the data from the customer form
      const transmit = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username.toLowerCase(),
        password: formData.password,
        deliveryAddress: {
          address1: formData.address1,
          address2: formData.address2,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country,
          phonePrefix: formData.phonePrefix,
          phone: formData.phone,
        },
        billingAddress: {
          address1: formData.address1,
          address2: formData.address2,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country,
          phonePrefix: formData.phonePrefix,
          phone: formData.phone,
        },
      };
      console.log(transmit);

      try {
        // send the data to the backend
        const res = await register(transmit);
        console.log("res", res);
        console.log("res.status", res.status);
        if (res.status === 201) {
          setSuccess(true);
          handleShowSnackbar(true);

          console.log("Registration successful");

          //falls man von der configuration Seite kommt
          const unsavedConfig = location.state?.unsavedConfig;

          if (unsavedConfig) {
            console.log("unsavedConfig", unsavedConfig);
            localStorage.setItem(
              "unsavedConfig",
              JSON.stringify(unsavedConfig)
            );
          }
          
        } else {
          setSuccess(false);
          setErrorMessage("Registration failed! Please try again.");
          handleShowSnackbar(false);
        }
      } catch (error) {
        setSuccess(false);
        handleShowSnackbar(false);

        console.error("Registration failed", error);
        if (error.response?.data?.error) {
          setErrorMessage(error.response.data.error);
        } else {
          setErrorMessage("An unexpected error occurred. Please try again.");
        }
      }
    }
  };

  // Snackbar
  const handleShowSnackbar = (Isuccess) => {
    // set the state of the snackbar
    if (Isuccess) {
      setOpenS(true);
    } else {
      setOpenF(true);
      setTimeout(() => {
        setOpenF(false);
      }, 5000);
    }
    // Snackbar will disappear after 5 seconds
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
          maxWidth: "100%",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>

        <Tabs
          onChange={handleCheckboxChangeT}
          value={checkedT}
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

        {checkedT === "customer" ? (
          <CustomerRegisterForm
            formData={formData}
            checked={checked}
            handleCheckboxChange={handleCheckboxChange}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
          />
        ) : (
          <TailorRegisterForm
            tailorFormData={tailorFormData}
            handleChange={handleChangeT}
            handleSubmit={handleSubmit}
          />
        )}
      </Box>
      {success ? (
        <Snackbar
          open={openS}
          autoHideDuration={1500}
          onClose={() => {
            setOpenS(false);
            navigate("/login");
          }}
        >
          <Alert onClose={() => setOpenS(false)} severity="success">
            Registration successful! Please login to continue.
          </Alert>
        </Snackbar>
      ) : (
        <Snackbar
          open={openF}
          autoHideDuration={3000}
          onClose={() => {
            setOpenF(false);
          }}
        >
          <Alert onClose={() => setOpenF(false)} severity="error">
            {errorMessage}
          </Alert>
        </Snackbar>
      )}
    </Container>
  );
}
