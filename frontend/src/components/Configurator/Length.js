import React from "react";
import { Button, Typography } from "@mui/material";
import maxi from "../../images/maxi.png";
import midi from "../../images/midi.png";
import { lengthPrices } from "./data.js"; //import prices

export default function Length(props) {
  return (
    <div className="configContainer">
      <Button
        variant="contained"
        color={props.long ? "primary" : "secondary"}
        name="Length"
        value="Long"
        className="configSelectionButton"
        sx={{ border: "1px solid lightgray", flexDirection: "column" }}
        onClick={(e) => {
          props.handleUpdate(e);
          props.handleLong();
        }}
      >
        <img
          src={maxi}
          alt="Maxi Dress"
          style={{ maxHeight: "180px", marginBottom: "20px" }}
        />
        Long
        {lengthPrices["Long"] > 0 && (
          <Typography>(+{lengthPrices["Long"]}€)</Typography>
        )}
      </Button>
      <Button
        variant="contained"
        color={props.midi ? "primary" : "secondary"}
        name="Length"
        value="Midi"
        className="configSelectionButton"
        sx={{
          marginLeft: "50px",
          border: "1px solid lightgray",
          flexDirection: "column",
        }}
        onClick={(e) => {
          props.handleUpdate(e);
          props.handleMidi();
        }}
      >
        <img
          src={midi}
          alt="Midi Dress"
          style={{ maxHeight: "180px", marginBottom: "20px" }}
        />
        Midi
        {lengthPrices["Midi"] > 0 && (
          <Typography>(+{lengthPrices["Midi"]}€)</Typography>
        )}
      </Button>
    </div>
  );
}
