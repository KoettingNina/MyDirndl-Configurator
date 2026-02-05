import React from "react";
import { Button, Typography } from "@mui/material";
import boxNeckline from "../../images/box-neckline.png";
import vNeckline from "../../images/v-neckline.png";
import { necklinePrices } from "./data.js"; //import prices

export default function Neckline(props) {
  return (
    <div className="configContainer">
      <Button
        variant="contained"
        color={props.v ? "primary" : "secondary"}
        name="Neck"
        value="v-neck"
        className="configSelectionButton"
        sx={{ border: "1px solid lightgray", flexDirection: "column" }}
        onClick={(e) => {
          props.handleUpdate(e);
          props.handleV();
        }}
      >
        <img
          src={vNeckline}
          alt="V-Neckline"
          style={{ maxHeight: "150px", marginBottom: "20px" }}
        />
        V-Neck
        {necklinePrices["v-neck"] > 0 && (
          <Typography>(+{necklinePrices["v-neck"]}€)</Typography>
        )}
      </Button>
      <Button
        variant="contained"
        color={props.box ? "primary" : "secondary"}
        name="Neck"
        value="box-neck"
        className="configSelectionButton"
        sx={{
          marginLeft: "50px",
          border: "1px solid lightgray",

          flexDirection: "column",
          alignItems: "center",
        }}
        onClick={(e) => {
          props.handleUpdate(e);
          props.handleBox();
        }}
      >
        <img
          src={boxNeckline}
          alt="Box Neckline"
          style={{ maxHeight: "150px", marginBottom: "20px" }}
        />
        Box-Neckline
        {necklinePrices["box-neck"] > 0 && (
          <Typography>(+{necklinePrices["box-neck"]}€)</Typography>
        )}
      </Button>
    </div>
  );
}
