import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Grid,
  Autocomplete,
} from "@mui/material";
import axios from "axios";
import { useAuth } from "../authentication/AuthContext";
import { set } from "mongoose";
import { countries } from "countries-list";

/**
 * Represents the customer settings page.
 * This component displays and allows users to edit their personal information and addresses.
 */
const CustomerSettingsPage = () => {
  // Get the user data using the useAuth hook
  const { user } = useAuth();

  // State to manage the visibility of a dialog
  const [openDialog, setOpenDialog] = useState(false);

  // States for managing the Snackbar notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false); // State for Snackbar visibility
  const [snackbarMessage, setSnackbarMessage] = useState(""); // State for Snackbar message
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // State for Snackbar severity

  // State to manage form errors
  const [errors, setErrors] = useState({});

  // State to manage the user's profile information
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    deliveryAddress: {
      address1: "",
      address2: "",
      zip: "",
      city: "",
      state: "",
      country: "",
      phonePrefix: "",
      phone: "",
    },
    billingAddress: {
      address1: "",
      address2: "",
      zip: "",
      city: "",
      state: "",
      country: "",
      phonePrefix: "",
      phone: "",
    },
  });

  // State to store the initial profile information for comparison
  const [initialProfile, setInitialProfile] = useState({
    firstName: "",
    lastName: "",
    deliveryAddress: {
      address1: "",
      address2: "",
      zip: "",
      city: "",
      state: "",
      country: "",
      phonePrefix: "",
      phone: "",
    },
    billingAddress: {
      address1: "",
      address2: "",
      zip: "",
      city: "",
      state: "",
      country: "",
      phonePrefix: "",
      phone: "",
    },
  });

  // Generate a list of countries for dropdown menus
  const countriesList = Object.values(countries).map((country) => ({
    name: country.name,
    phone: country.phone,
  }));

  // Handle change for country selection in delivery address
  const handleOnChangeCountry = (event, newValue) => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      deliveryAddress: {
        ...prevProfile.deliveryAddress,
        country: newValue ? newValue.name : "",
      },
    }));
  };

  // Handle change for phone prefix selection in delivery address
  const handleOnChangePrefix = (event, newValue) => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      deliveryAddress: {
        ...prevProfile.deliveryAddress,
        phonePrefix: newValue ? newValue.phone[0] : "",
      },
    }));
  };

  /**
   * Fetches user data from the backend API.
   *
   * @param {string} user - The user ID.
   * @returns {Promise<void>} - A promise that resolves when the user data is fetched successfully.
   */
  const fetchUserData = async (user) => {
    try {
      const response = await axios.get(
        `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/customers/userDetails/${user}`,
        { withCredentials: true }
      );
      const userData = response.data;
      console.log("userDate", userData);
      setProfile({
        firstName: userData.firstName,
        lastName: userData.lastName,
        deliveryAddress: userData.deliveryAddress,
        billingAddress: userData.billingAddress,
      });
      setInitialProfile({
        firstName: userData.firstName,
        lastName: userData.lastName,
        deliveryAddress: userData.deliveryAddress,
        billingAddress: userData.billingAddress,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // useEffect hook to fetch user data when the component mounts or when the user changes
  useEffect(() => {
    if (user) {
      fetchUserData(user);
    }
  }, [user]);

  // Validation functions for various fields
  const validateFirstName = (firstName) => {
    const nameRegex = /^[a-zA-Z]+(?:[-'][a-zA-Z]+)*$/;
    return nameRegex.test(firstName);
  };
  const validateLastName = (lastName) => {
    const nameRegex = /^[a-zA-Z]+$/;
    return nameRegex.test(lastName);
  };
  const validateAddress1 = (address1) => {
    const addressRegex = /^[a-zA-Z0-9ßüöä\s,'-]*$/;
    return addressRegex.test(address1);
  };
  const validateZip = (zip) => {
    const zipRegex = /^[0-9]{5}$/;
    return zipRegex.test(zip);
  };
  const validateCity = (city) => {
    const cityRegex = /^[a-zA-Zßüöä]+$/;
    return cityRegex.test(city);
  };
  const validateState = (state) => {
    const stateRegex = /^[a-zA-Zßüöä]+$/;
    return stateRegex.test(state);
  };
  const validateCountry = (country) => {
    const countryRegex = /^[a-zA-Zßüöä]+$/;
    return countryRegex.test(country);
  };

  /**
   * Validates the inputs for the customer settings page.
   * @returns {boolean} Returns true if all inputs are valid, otherwise false.
   */
  const validateInputs = () => {
    const newErrors = {};
    console.log("Profile:", profile);
    // Validate Personal Information
    if (!profile.firstName || !validateFirstName(profile.firstName)) {
      newErrors.firstName = "Please enter a valid first name";
    }
    if (!profile.lastName || !validateLastName(profile.lastName)) {
      newErrors.lastName = "Please enter a valid last name";
    }
    if (!validateAddress1(profile.deliveryAddress.address1)) {
      newErrors.address1 = "Please enter a valid address";
    }
    if (
      !profile.deliveryAddress.zip ||
      !validateZip(profile.deliveryAddress.zip)
    ) {
      newErrors.zip = "Please enter a valid zip code";
    }
    if (
      !profile.deliveryAddress.city ||
      !validateCity(profile.deliveryAddress.city)
    ) {
      newErrors.city = "Please enter a valid city";
    }
    if (
      !profile.deliveryAddress.state ||
      !validateState(profile.deliveryAddress.state)
    ) {
      newErrors.state = "Please enter a valid state";
    }
    if (!validateCountry(profile.deliveryAddress.country)) {
      newErrors.country = "Please enter a valid country";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles the change event for input fields.
   * Updates the profile state based on the changed input field.
   *
   * @param {Object} e - The event object.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    const [addressType, addressField] = name.split(".");
    if (addressType === "deliveryAddress" || addressType === "billingAddress") {
      setProfile((prevProfile) => ({
        ...prevProfile,
        [addressType]: {
          ...prevProfile[addressType],
          [addressField]: value,
        },
      }));
    } else {
      setProfile((prevProfile) => ({
        ...prevProfile,
        [name]: value,
      }));
    }
  };

  // Function to open the dialog
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  // Function to close the dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Function to close the Snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  /**
   * Handles the form submission for updating the customer profile.
   * @param {Event} e - The form submission event.
   * @returns {Promise<void>} - A promise that resolves when the profile is successfully updated.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateInputs()) {
      if (JSON.stringify(profile) !== JSON.stringify(initialProfile)) {
        try {
          const response = await axios.put(
            `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/customers/userDetails/${user}`,
            profile,
            { withCredentials: true }
          );
          if (response.status === 200) {
            setInitialProfile(profile);
            setSnackbarMessage("Changes saved successfully");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
          }
        } catch (error) {
          console.error("Error updating profile:", error);
          setSnackbarMessage("Error while saving changes");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        }
      } else {
        console.log("No changes to save.");
      }
    }
  };

  // Function to render a text field with a label, name, and value
  const renderTextField = (label, name, value) => (
    <TextField
      key={name}
      label={label}
      name={name}
      value={value || ""}
      onChange={handleChange}
      variant="outlined"
      margin="normal"
    />
  );

  return (
    <Container
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: "100vh",
        padding: "60px",
        marginTop: "50px",
      }}
    >
      <Box
        sx={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          width: "65%",
          margin: "0 20px",
          padding: "20px",
          borderTop: "5px solid #6f0a21",
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          align="center"
          sx={{ marginBottom: "20px", color: "#6f0a21" }}
        >
          Personal Information
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <TextField
            label="First Name"
            name="firstName"
            value={profile.firstName}
            onChange={handleChange}
            variant="outlined"
            margin="normal"
            error={Boolean(errors.firstName)}
            helperText={errors.firstName}
          />
          <TextField
            label="Last Name"
            name="lastName"
            value={profile.lastName}
            onChange={handleChange}
            variant="outlined"
            margin="normal"
            error={Boolean(errors.lastName)}
            helperText={errors.lastName}
          />
          <Typography variant="h6" color="primary" sx={{ marginTop: "20px" }}>
            Delivery & Billing Address
          </Typography>
          {["address1", "address2", "zip", "city", "state"].map((field) => (
            <TextField
              key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              required={field === "address2" ? false : true}
              name={`deliveryAddress.${field}`}
              value={profile.deliveryAddress?.[field] || ""}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
              error={Boolean(errors[field])}
              helperText={errors[field]}
            />
          ))}

          <Grid item xs={12}>
            <Autocomplete
              id="country"
              options={countriesList}
              getOptionLabel={(option) => option.name}
              value={
                countriesList.find(
                  (country) => country.name === profile.deliveryAddress.country
                ) || null
              }
              renderInput={(params) => (
                <TextField {...params} label="Country" margin="normal" />
              )}
              onChange={handleOnChangeCountry}
            />
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={2}>
              <Autocomplete
                id="countryPrefix"
                options={countriesList}
                getOptionLabel={(option) => `${option.name} (+${option.phone})`}
                style={{ width: 200, marginRight: 8 }}
                value={
                  countriesList.find((country) =>
                    country.phone.includes(
                      Number(profile.deliveryAddress.phonePrefix)
                    )
                  ) || null
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Country Prefix"
                    margin="normal"
                    error={Boolean(errors.phonePrefix)}
                    helperText={errors.phonePrefix}
                  />
                )}
                onChange={handleOnChangePrefix}
              />

              <TextField
                margin="normal"
                fullWidth
                id="phone"
                label="Phone Number"
                name="deliveryAddress.phone"
                value={profile.deliveryAddress.phone || ""}
                onChange={handleChange}
                //autoComplete="phone"
              />
            </Box>
          </Grid>
          {/* <Typography variant="h6" sx={{ marginTop: "20px" }}>
            Billing Address
          </Typography>
          {[
            "address1",
            "address2",
            "zip",
            "city",
            "state",
            "country",
            "phonePrefix",
            "phone",
          ].map((field) => (
            <TextField
              key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              name={`billingAddress.${field}`}
              value={profile.billingAddress?.[field] || ""}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
            />
          ))} */}
          <Button
            onClick={() => handleOpenDialog()}
            //type="submit"
            variant="contained"
            sx={{
              backgroundColor: "#6f0a21",
              color: "white",
              marginTop: "20px",
              "&:hover": { backgroundColor: "#5a081c" },
            }}
          >
            Save Changes
          </Button>
        </Box>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Profile Settings</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to change the settings of your profile?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={(e) => {
              handleSubmit(e);
              handleCloseDialog();
            }}
            color="primary"
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CustomerSettingsPage;
