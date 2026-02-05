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
} from "@mui/material";
import axios from "axios";
import { useAuth } from "../authentication/AuthContext";
import { set } from "mongoose";

const TailorSettingsPage = () => {
  // Use the useAuth hook to get the tailor ID
  const { tailor } = useAuth();

  // State to manage the open/close status of the dialog regarding profile changes
  const [openDialog, setOpenDialog] = useState(false);

  // State to manage form validation errors
  const [errors, setErrors] = useState({});

  // State to manage the snackbar (notification) visibility and message
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // State to manage the current tailor profile information
  const [tailorProfile, setTailorProfile] = useState({
    username: "",
    capacity: "",
    bankInfo: "",
    itemsToTailor: "",
  });

  // State to manage the initial tailor profile information for comparison
  const [initialTailorProfile, setInitialTailorProfile] = useState({
    username: "",
    capacity: "",
    bankInfo: "",
    itemsToTailor: "",
  });

  // Function to fetch tailor data from the server
  const fetchTailorData = async (tailor) => {
    const url = `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/tailors/tailorDetails/${tailor}`;

    // Create an axios instance with custom configuration
    const axiosInstance = axios.create({
      withCredentials: true,
      baseURL: `http://${process.env.REACT_APP_BACKEND_URL}:8080`,
    });

    // Fetch tailor details
    axiosInstance
      .get(`/api/tailors/tailorDetails/${tailor}`)
      .then((response) => {
        console.log("Response:", response.data);
        // Update the tailorProfile state with the fetched data
        setTailorProfile({
          ...tailorProfile,
          ["username"]: response.data.username,
          ["capacity"]: response.data.capacity,
          ["bankInfo"]: response.data.bankInfo,
          ["itemsToTailor"]: response.data.itemsToTailor,
        });
        // Also update the initialTailorProfile state
        setInitialTailorProfile({
          ...tailorProfile,
          ["username"]: response.data.username,
          ["capacity"]: response.data.capacity,
          ["bankInfo"]: response.data.bankInfo,
          ["itemsToTailor"]: response.data.itemsToTailor,
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  // useEffect hook to fetch tailor data when the component mounts or when the tailor value changes
  useEffect(() => {
    if (tailor) {
      fetchTailorData(tailor);
    }
  }, [tailor]);

  // Function to validate the username (must be a valid email)
  const validateUsername = (username) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(username);
  };

  // Function to validate the capacity
  const validateCapacity = (capacity) => {
    if (capacity < tailorProfile.itemsToTailor.length) {
      return false;
    } else if (capacity < 0) {
      return false;
    } else {
      return true;
    }
  };

  // Function to validate the IBAN (bank account number)
  const validateIBAN = (iban) => {
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;
    return ibanRegex.test(iban);
  };

  // Function to validate all input fields
  const validateInputs = () => {
    const newErrors = {};

    if (!tailorProfile.username || !validateUsername(tailorProfile.username)) {
      newErrors.username = "Valid email is required";
    }

    if (!tailorProfile.capacity || !validateCapacity(tailorProfile.capacity)) {
      if (!tailorProfile.capacity) {
        newErrors.capacity = "You have to enter a capacity";
      } else {
        newErrors.capacity =
          "Capacity must be at least the number of items you have to tailor";
      }
    }

    if (!tailorProfile.bankInfo || !validateIBAN(tailorProfile.bankInfo)) {
      newErrors.bankInfo = "Valid IBAN is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to open the dialog
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  // Function to close the dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Function to handle input changes and update the state
  const handleChange = (e) => {
    const { name, value } = e.target;

    setTailorProfile((prevTailorProfile) => ({
      ...prevTailorProfile,
      [name]: value,
    }));
  };

  // Function to close the snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateInputs()) {
      if (
        JSON.stringify(tailorProfile) !== JSON.stringify(initialTailorProfile)
      ) {
        try {
          // Send a PUT request to update the tailor profile
          const response = await axios.put(
            `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/tailors/tailorDetails/${tailor}`,
            tailorProfile,
            { withCredentials: true }
          );
          if (response.status === 200) {
            console.log("Changes saved successfully");
            setInitialTailorProfile(tailorProfile);
            setSnackbarMessage("Changes saved successfully");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
          }
        } catch (error) {
          console.error(
            "Error regarding handleSubmit for Tailor Profile change:",
            error
          );
          setSnackbarMessage("Error while saving changes");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        }
      }
    }
  };

  return (
    <Container
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: "100vh",
        padding: "60px",
        marginTop: "50px",
        width: "100%",
      }}
    >
      <Box
        sx={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          width: "35%",
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
            label="Username"
            name="username"
            value={tailorProfile.username}
            onChange={handleChange}
            variant="outlined"
            margin="normal"
            error={Boolean(errors.username)}
            helperText={errors.username}
          />
          <TextField
            label="Capacity"
            name="capacity"
            value={tailorProfile.capacity}
            onChange={handleChange}
            variant="outlined"
            margin="normal"
            error={Boolean(errors.capacity)}
            helperText={errors.capacity}
          />
          <TextField
            label="IBAN/BIC"
            name="bankInfo"
            value={tailorProfile.bankInfo}
            onChange={handleChange}
            variant="outlined"
            margin="normal"
            error={Boolean(errors.bankInfo)}
            helperText={errors.bankInfo}
          />
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

export default TailorSettingsPage;
