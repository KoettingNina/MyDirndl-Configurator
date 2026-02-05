import { Autocomplete, TextField, Box, Grid, Typography } from "@mui/material";
import { countries } from "countries-list";
import { useState } from "react";

function AddressInput({ handleChange }) {
  /**
   * Represents a list of countries.
   *
   * @typedef {Object} Country
   * @property {string} name - The name of the country.
   * @property {string} phone - The phone code of the country.
   */

  /**
   * Creates a list of countries from the provided countries object.
   *
   * @type {Country[]}
   */
  const countriesList = Object.values(countries).map((country) => ({
    name: country.name,
    phone: country.phone,
  }));

  const handleOnChangeCountry = (event, newValue) => {
    handleChange("country", newValue ? newValue.name : "");
  };

  const handleOnChangePrefix = (event, newValue) => {
    handleChange("phonePrefix", newValue ? newValue.phone[0] : "");
  };

  return (
    <Grid>
      <Grid item xs={12}>
        <Typography
          sx={{
            fontSize: "1rem", // smaller font size
            color: "lightgray", // light gray color
          }}
        >
          Add Address Information below
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="address"
          label="Street and Number"
          name="address"
          autoComplete="Musterstreet 123"
          autoFocus
          onChange={(e) => handleChange("address1", e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          margin="normal"
          optional
          fullWidth
          id="address2"
          label="Additional Address Information"
          name="address2"
          autoComplete="apartment/suite/unit/building/floor etc."
          onChange={(e) => handleChange("address2", e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="city"
          label="City"
          name="city"
          autoComplete="city"
          onChange={(e) => handleChange("city", e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="state"
          label="State"
          name="state"
          autoComplete="state"
          onChange={(e) => handleChange("state", e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="zip"
          label="Zip Code"
          name="zip"
          autoComplete="zip"
          onChange={(e) => handleChange("zip", e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <Autocomplete
          id="country"
          options={countriesList}
          getOptionLabel={(option) => option.name}
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
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Country Prefix"
                margin="normal"
              />
            )}
            onChange={handleOnChangePrefix}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            id="phone"
            label="Phone Number"
            name="phone"
            autoComplete="phone"
            onChange={(e) => handleChange("phone", e.target.value)}
          />
        </Box>
      </Grid>
    </Grid>
  );
}

export default AddressInput;
