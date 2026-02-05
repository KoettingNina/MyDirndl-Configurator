import React, { useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import AddressInput from "./AddressInput";
import { Typography } from "@mui/material";

export default function TailorRegisterForm({
  tailorFormData,
  handleChange,
  handleSubmit,
}) {
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validateIBAN = (iban) => {
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;
    return ibanRegex.test(iban);
  };

  const validateBIC = (bic) => {
    const bicRegex = /^[A-Z]{4}[A-Z]{2}[A-Z2-9][A-NP-Z0-9]([A-Z0-9]{3})?$/;
    return bicRegex.test(bic);
  };

  /**
   * Validates the tailor registration form.
   * @returns {boolean} Returns true if the form is valid, otherwise false.
   */
  const validateForm = () => {
    const newErrors = {};

    if (!tailorFormData.username || !validateEmail(tailorFormData.username)) {
      newErrors.username = "Valid email is required";
    }

    if (!tailorFormData.password || tailorFormData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    if (!tailorFormData.firstName) {
      newErrors.firstName = "First name is required";
    }

    if (!tailorFormData.lastName) {
      newErrors.lastName = "Last name is required";
    }

    if (!tailorFormData.capacity || tailorFormData.capacity < 1) {
      newErrors.capacity = "Capacity must be at least 1";
    }

    if (
      !tailorFormData.bankInfo ||
      (!validateIBAN(tailorFormData.bankInfo) &&
        !validateBIC(tailorFormData.bankInfo))
    ) {
      newErrors.bankInfo = "Valid IBAN or BIC is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
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
            autoComplete="username"
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
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            name="capacity"
            label="Capacity"
            type="number"
            id="capacity"
            autoComplete="1"
            onChange={(e) => handleChange("capacity", e.target.value)}
            error={Boolean(errors.capacity)}
            helperText={errors.capacity}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            name="bankInfo"
            label="IBAN/BIC"
            type="text"
            id="bankInfo"
            onChange={(e) => handleChange("bankInfo", e.target.value)}
            error={Boolean(errors.bankInfo)}
            helperText={errors.bankInfo}
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
} // TailorRegisterForm
