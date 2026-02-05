import React, { useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import AddressInput from "./AddressInput";
import { Typography } from "@mui/material";

export default function TailorRegisterForm({
  formData,
  checked,
  handleChange,
  handleCheckboxChange,
  handleSubmit,
}) {
  const [errors, setErrors] = useState({});

  /**
   * Validates an email address using a regular expression.
   *
   * @param {string} email - The email address to validate.
   * @returns {boolean} - Returns true if the email is valid, otherwise false.
   */
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  /**
   * Validates the form data and returns true if the form is valid, false otherwise.
   *
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  const validateForm = () => {
    const newErrors = {};

    console.log(formData);

    if (!formData.firstName) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.username || !validateEmail(formData.username)) {
      newErrors.username = "Valid email is required";
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles the local form submission.
   *
   * @param {Event} event - The form submission event.
   */
  const handleLocalSubmit = (event) => {
    event.preventDefault();
    if (validateForm()) {
      handleSubmit(event);
    }
  };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleLocalSubmit}
      sx={{ mt: 3 }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            autoComplete="given-name"
            name="firstName"
            required
            fullWidth
            id="firstName"
            label="First Name"
            autoFocus
            onChange={(e) => handleChange("firstName", e.target.value)}
            error={Boolean(errors.firstName)}
            helperText={errors.firstName}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="lastName"
            label="Last Name"
            name="lastName"
            autoComplete="family-name"
            onChange={(e) => handleChange("lastName", e.target.value)}
            error={Boolean(errors.lastName)}
            helperText={errors.lastName}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="username"
            label="E-Mail Address"
            name="username"
            autoComplete="email"
            onChange={(e) => handleChange("username", e.target.value)}
            error={Boolean(errors.username)}
            helperText={errors.username}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            onChange={(e) => handleChange("password", e.target.value)}
            error={Boolean(errors.password)}
            helperText={errors.password}
          />
        </Grid>
        {checked && (
          <Grid item xs={12}>
            <AddressInput handleChange={handleChange} />
          </Grid>
        )}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={checked}
                onChange={handleCheckboxChange}
                value="enterBillingADelivAddress"
                color="primary"
              />
            }
            label="I want to add my billing and delivery address now."
          />
        </Grid>
      </Grid>

      <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
        Sign Up
      </Button>
      <Grid container justifyContent="flex-end">
        <Grid item>
          <Link href="/login" variant="body2" color="primary">
            Already have an account? Sign in
          </Link>
        </Grid>
      </Grid>
    </Box>
  );
}
