import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import {
  Alert,
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  Snackbar,
} from "@mui/material";
import axios from "axios";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../authentication/AuthContext";

export default function MeasurementForm(props) {
  const navigate = useNavigate();
  const location = useLocation();

  // when click on save button:
  // 1. extract measurements from click event
  const handleSubmit = async (event) => {
    // if not logged in then show error and navigate to login page and save measurements in local storage
    event.preventDefault();
    // the data form the click event when the user is not logged in
    const data = new FormData(event.currentTarget);
    const measurement = {
      name: data.get("name"),
      bustSize: data.get("bust"),
      waistSize: data.get("waist"),
      hipSize: data.get("hip"),
      height: data.get("length"),
    };
    if (!props.customerId) {
      setOpenLoginError(true);

      // the retrieved data from the click event and the current config are saved in local storage
      localStorage.setItem("unsavedMeasurements", JSON.stringify(measurement));
      localStorage.setItem("unsavedConfig", JSON.stringify(props.config));
      setOpenLoginError(true);
      // navigate to login page
      navigate("/login", {
        state: {
          from: "measurement",
          unsavedMeasurement: measurement,
        },
      });
    } else {
      event.preventDefault();
      // if user is logged in then save measurements in DB
      const data = new FormData(event.currentTarget);
      const measurement = {
        name: data.get("name"),
        bustSize: data.get("bust"),
        waistSize: data.get("waist"),
        hipSize: data.get("hip"),
        height: data.get("length"),
        customerAccount: props.customerId,
      };
      // 2. get all names in DB for current user
      // const namesInDBForMe = props.measurements.map((m) => m.name);
      console.log("props", props);
      const namesInDBForMe = props.measurements.map((m) => m.name);

      console.log("saveMeasurement names", namesInDBForMe);
      // 3. either save or update in DB
      try {
        // if measurement.name not yet in DB: create
        if (
          props.measurements.length === 0 ||
          !namesInDBForMe.includes(measurement.name)
        ) {
          const response = await axios.post(
            `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/customerMeasurements/create`,
            measurement, {withCredentials: true}
          );
          console.log("created status: " + response.status);
          if (response.status === 201) {
            const measurementId = response.data._id;
            console.log("now calling handleChangeThroughSave");
            measurement._id = measurementId;
            props.setMeasurements([...props.measurements, measurement]);
            handleChangeThroughSave(measurement);
            setSaveSuccess(true);
          }
        } else {
          // if measurement.name already in DB: update
          // get id of name
          const idOfName = props.measurements.find(
            (item) => item.name === name
          )._id;
          // update measurement in db
          const responseUpdate = await axios.put(
            `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/customerMeasurements/update/${idOfName}`,
            measurement, {withCredentials: true}
          );
          console.log("updated status: " + responseUpdate.status);

          if (responseUpdate.status === 200) {
            // add the id to the ew measurement item so that it can be referenced again
            measurement._id = idOfName;
            // if update was successful, update the measurements in the state
            const updatedMeasurements = props.measurements.map((item) =>
              item._id === idOfName ? measurement : item
            );
            props.setMeasurements(updatedMeasurements);
            handleChangeThroughUpdate(measurement);
            setSaveSuccess(true);
            props.setSelected(measurement);
          }
        }
      } catch (error) {
        console.error("Error posting measurements", error);
        setOpen(true);
      }
    }
  };

  // if the selected measurements change, the input fields are updated
  useEffect(() => {
    if (props.selected) {
      setName(props.selected.name || "");
      setBust(props.selected.bustSize || "");
      setWaist(props.selected.waistSize || "");
      setHip(props.selected.hipSize || "");
      setLength(props.selected.height || "");
    }
  }, [props.selected]);

  // function to change the selected measurements by the dropdown
  const handleChange = (e) => {
    // setting the selected measurements to the selected ones by dropdown
    console.log("changing value in name " + e.target.value.name);
    setName(e.target.value.name);
    setBust(e.target.value.bustSize);
    setHip(e.target.value.hipSize);
    setWaist(e.target.value.waistSize);
    setLength(e.target.value.height);

    props.setSelected(e.target.value);
    console.log("selected " + props.selected.name);
  };

  // function to change the selected measurements by the save/update button
  const handleChangeThroughSave = (m) => {
    // setting the selected measurements to the newly saved ones
    console.log("changing value in name trough save " + m.name);
    setName(m.name);
    setBust(m.bustSize);
    setHip(m.hipSize);
    setWaist(m.waistSize);
    console.log("height: " + length);
    setLength(m.height);
    console.log("height: " + length);
    console.log("saved and selected " + m);
    props.setSelected(m);
    console.log("selected " + props.selected);
  };

  // setting the selected measurements to the newly updated ones
  const handleChangeThroughUpdate = (m) => {
    console.log("changing value trough update for " + m.name);
    setName(m.name);
    setBust(m.bustSize);
    setHip(m.hipSize);
    setWaist(m.waistSize);
    setLength(m.height);
    console.log("updated and selected " + m);
    props.setSelected(m);
    console.log("selected " + props.selected);
    const updatedMeasurements = props.measurements.map((item) =>
      item._id === m._id ? m : item
    );
    props.setMeasurements(updatedMeasurements);
  };

  // function to delete a measurement by clicking on the trash bin icon
  const handleDelete = async (name) => {
    console.log("deleting " + name);
    try {
      console.log("in try");
      const idOfName = props.measurements.find(
        (item) => item.name === name
      )._id;
      console.log("id: ", idOfName);
      const response = await axios.delete(
        `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/customerMeasurements/delete/${idOfName}`, {withCredentials: true}
      );
      console.log(response.data);
      console.log("deleted status: " + response.status);
      const newMeasurements = props.measurements.filter(
        (item) => item.name !== name
      );
      props.setMeasurements(newMeasurements);
      props.setSelected("");
      setName("");
      setBust("");
      setWaist("");
      setHip("");
      setLength("");
    } catch (error) {
      console.error("Error deleting measurements", error);
    }
  };

  // these states change as soon as the user types in the input fields
  const [name, setName] = React.useState("");
  const [bust, setBust] = React.useState("");
  const [waist, setWaist] = React.useState("");
  const [hip, setHip] = React.useState("");
  const [length, setLength] = React.useState("");

  // snackbar error message state when not all fields are filled out
  const [open, setOpen] = React.useState(false);
  const handleClose = (event, reason) => {
    // if (reason === "clickaway") {
    //   return;
    // }
    setOpen(false);
    setOpenLoginError(false);
    setSaveSuccess(false);
  };

  const [saveSuccess, setSaveSuccess] = React.useState(false);
  // snackbar error message state not logged in
  const [openLoginError, setOpenLoginError] = React.useState(false);

  return (
    <Box
      className="measurementForm"
      style={{ marginLeft: "100px" }}
      component="form"
      noValidate
      onSubmit={handleSubmit}
    >
      {props.mearuementsAvailable && (
        <FormControl fullWidth margin="normal">
          <InputLabel>Use the measurements I saved for ...</InputLabel>
          <Select
            label="Use the measurements I saved for ..."
            id="selectedName"
            name={props.selected}
            InputLabelProps={{ shrink: true }}
            value={props.selected.name}
            margin="normal"
            onChange={(e) => handleChange(e)}
          >
            {props.measurements.map((measurement) => (
              <MenuItem
                value={measurement}
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                {measurement.name}

                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(measurement.name)}
                >
                  <DeleteIcon />
                </IconButton>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <TextField
        label="Nickname"
        id="name"
        name="name"
        InputLabelProps={{ shrink: true }}
        fullWidth
        required
        margin="normal"
        value={name || ""}
        onChange={(event) => setName(event.currentTarget.value)}
      />

      <TextField
        margin="normal"
        id="bust"
        name="bust"
        label="A: Bust size in cm"
        type="number"
        InputLabelProps={{ shrink: true }}
        value={bust || ""}
        fullWidth
        required
        onChange={(event) => setBust(event.currentTarget.value)}
      />
      <TextField
        margin="normal"
        id="waist"
        name="waist"
        label="B: Waist size in cm"
        type="number"
        InputLabelProps={{ shrink: true }}
        fullWidth
        required
        value={waist || ""}
        onChange={(event) => setWaist(event.currentTarget.value)}
      />
      <TextField
        margin="normal"
        id="hip"
        name="hip"
        label="C: Hip size in cm"
        type="number"
        InputLabelProps={{ shrink: true }}
        fullWidth
        required
        value={hip || ""}
        onChange={(event) => setHip(event.currentTarget.value)}
      />
      <TextField
        margin="normal"
        id="length"
        name="length"
        label="D: Hollow to floor in cm"
        type="number"
        InputLabelProps={{ shrink: true }}
        fullWidth
        required
        value={length || ""}
        onChange={(event) => setLength(event.currentTarget.value)}
      />
      <Button
        type="submit"
        color="primary"
        variant="contained"
        disabled={
          name === "" ||
          bust === "" ||
          waist === "" ||
          hip === "" ||
          length === ""
        }
        // || !props.customerId
      >
        {props.selected === "" && "Save"}
        {props.selected !== "" && "Update"}
      </Button>
      {(name !== "" ||
        bust !== "" ||
        waist !== "" ||
        hip !== "" ||
        length !== "") && (
        <Button
          color="secondary"
          variant="contained"
          style={{ marginLeft: "10px" }}
          onClick={() => {
            setName("");
            setBust("");
            setWaist("");
            setHip("");
            setLength("");
            props.setSelected("");
            if (props.setUnsavedMeasurements) {
              props.setUnsavedMeasurements(null);
            }
            // Aktualisiere location.state nach dem Leeren der Felder
            navigate("/configuration", {
              state: {
                ...location.state,
                unsavedMeasurements: null,
                step: 3,
              },
              replace: true,
            });
          }}
        >
          Clear
        </Button>
      )}
      {/* {!props.customerId && (
        <p style={{ color: "darkred" }}>
          You have to be logged in to save measurements.
        </p>
      )} */}
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
          Error saving measurements. Please check if all fields are filled out
          correctly.
        </Alert>
      </Snackbar>
      <Snackbar
        open={openLoginError}
        autoHideDuration={3000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
          You have to be logged in to save measurements.
        </Alert>
      </Snackbar>
      <Snackbar
        open={saveSuccess}
        autoHideDuration={3000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          Measurements saved successfully.
        </Alert>
      </Snackbar>
    </Box>
  );
}
