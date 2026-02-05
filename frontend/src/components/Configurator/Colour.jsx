import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Modal,
  Snackbar,
  Alert,
  SnackbarContent,
} from "@mui/material";
import { Canvg } from "canvg";
import { renderToStaticMarkup } from "react-dom/server";
import axios from "axios";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import dirndlSchablone from "../../images/dirndlSchablone1.png";
import knöpfe from "../../images/knöpfeSchablone.png";
import dirndlSchabloneV from "../../images/dirndlSchabloneHochgeschlossen.png";
import knoepfeV from "../../images/knöpfeHochgeschlossen.png";

import topImage from "../../images/topImage.jpg";
import skirtImage from "../../images/skirtImage.png";
import apronImage from "../../images/apronImage.png";

import { OBERTEIL_PATH, UNTERTEIL_PATH, SCHUERZE_PATH } from "./paths"; // paths of the SVG file
import { colorOptions, patterns } from "./data.js"; // import of patterns, price

import { useAuth } from "../../authentication/AuthContext.js";
import { useNavigate } from "react-router-dom";

// Function to select the appropriate dirndl template based on the configuration
export const getSchablone = (config) => {
  if (config.Neck === "v-neck") {
    return dirndlSchabloneV;
  } else {
    return dirndlSchablone;
  }
};

// Function to select the appropriate buttons based on the configuration
export const getKnoepfe = (config) => {
  if (config.Neck === "v-neck") {
    return knoepfeV;
  } else {
    return knöpfe;
  }
};

// SVG component to display the dirndl with colors and patterns
export const SvgComponent = ({
  topPattern,
  bottomPattern,
  apronPattern,
  topColor,
  bottomColor,
  apronColor,
}) => (
  <svg
    width="500px"
    height="500px"
    viewBox="0 0 1400 1400"
    xmlns="http://www.w3.org/2000/svg"
    style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}
  >
    <defs>
      <pattern
        id="topPattern"
        patternUnits="userSpaceOnUse"
        width="400"
        height="400"
      >
        <image href={topPattern} x="0" y="0" width="400" height="400" />
      </pattern>
      <pattern
        id="bottomPattern"
        patternUnits="userSpaceOnUse"
        width="400"
        height="400"
      >
        <image href={bottomPattern} x="0" y="0" width="400" height="400" />
      </pattern>
      <pattern
        id="apronPattern"
        patternUnits="userSpaceOnUse"
        width="400"
        height="400"
      >
        <image href={apronPattern} x="0" y="0" width="400" height="400" />
      </pattern>
    </defs>
    <path id="Oberteil" fill={topColor} strokeWidth="1" d={OBERTEIL_PATH} />
    <path
      id="Unterteil"
      fill={bottomColor}
      strokeWidth="1"
      d={UNTERTEIL_PATH}
    />
    <path id="Schuerze" fill={apronColor} strokeWidth="1" d={SCHUERZE_PATH} />
    <path
      id="OberteilMuster"
      fill="url(#topPattern)"
      stroke="none"
      d={OBERTEIL_PATH}
    />
    <path
      id="UnterteilMuster"
      fill="url(#bottomPattern)"
      stroke="none"
      d={UNTERTEIL_PATH}
    />
    <path
      id="SchuerzeMuster"
      fill="url(#apronPattern)"
      stroke="none"
      d={SCHUERZE_PATH}
    />
  </svg>
);

export default function Colour({ config, price, handleSetConfig, handleSave }) {
  // State hooks for colors and patterns
  const [topColor, setTopColor] = useState(config.topColor || "#ffffff");
  const [bottomColor, setBottomColor] = useState(
    config.bottomColor || "#ffffff"
  );
  const [apronColor, setApronColor] = useState(config.apronColor || "#ffffff");
  const [topPattern, setTopPattern] = useState(config.topPattern || "");
  const [bottomPattern, setBottomPattern] = useState(
    config.bottomPattern || ""
  );
  const [apronPattern, setApronPattern] = useState(config.apronPattern || "");

  // Getting the user from the authentication context
  const { user } = useAuth();
  const customerId = user;

  const dirndlRef = useRef(null);

  // Effects to update the config when the state changes
  useEffect(() => {
    handleSetConfig("topColor", topColor);
  }, [topColor]);

  useEffect(() => {
    handleSetConfig("bottomColor", bottomColor);
  }, [bottomColor]);

  useEffect(() => {
    handleSetConfig("apronColor", apronColor);
  }, [apronColor]);

  useEffect(() => {
    handleSetConfig("topPattern", topPattern);
  }, [topPattern]);

  useEffect(() => {
    handleSetConfig("bottomPattern", bottomPattern);
  }, [bottomPattern]);

  useEffect(() => {
    handleSetConfig("apronPattern", apronPattern);
  }, [apronPattern]);

  // Function to render color options for selection
  const renderColorOptions = (currentColor, setColor) =>
    colorOptions.map((color) => (
      <Box key={color.id} sx={{ textAlign: "center", margin: "0 5px" }}>
        <Tooltip title={color.id}>
          <Box
            onClick={() => setColor(color.color)}
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              backgroundColor: color.color,
              cursor: "pointer",

              border: currentColor === color.color ? "2px solid black" : "none",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",

              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              "&:hover .price-tag": {
                display: "block",
              },
            }}
          >
            {/* if price higher than 0, then display the price on top of the color */}
            {color.price > 0 && (
              <Box
                className="price-tag"
                sx={{
                  display: "none",
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  padding: "0 2px",
                  borderRadius: "2px",
                }}
              >
                <Typography variant="caption">+{color.price}€</Typography>
              </Box>
            )}
          </Box>
        </Tooltip>
      </Box>
    ));

  const renderPatternOptions = (currentPattern, setPattern) =>
    patterns.map((pattern) => (
      <Box key={pattern.id} sx={{ textAlign: "center", margin: "0 5px" }}>
        <Tooltip title={pattern.id}>
          <Box
            onClick={() => setPattern(pattern.src)}
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              backgroundImage: `url(${pattern.thumbnail})`,
              backgroundSize: "cover",
              cursor: "pointer",
              border:
                currentPattern === pattern.src ? "2px solid black" : "none",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              "&:hover .price-tag": {
                display: "block",
              },
            }}
          >
            {pattern.price > 0 && (
              <Box
                className="price-tag"
                sx={{
                  display: "none",

                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  padding: "0 2px",
                  borderRadius: "2px",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    //backgroundColor: "rgba(255, 255, 255, 0.8)",
                    padding: "0 2px",
                  }}
                >
                  +{pattern.price}€
                </Typography>
              </Box>
            )}
          </Box>
        </Tooltip>
      </Box>
    ));

  const navigate = useNavigate();

  // Function to handle saving the dirndl configuration
  const handleSaveDirndl = async (isForCart = false) => {
    if (!customerId) {
      // Save the current configuration in local storage if the user is not logged in
      localStorage.setItem("unsavedConfig", JSON.stringify(config));
      navigate("/login", { state: { from: "/configuration" } });
    } else {
      await handleSave(isForCart);
    }
  };

  return (
    <Box sx={{ margin: "auto", position: "relative", minHeight: "600px" }}>
      <Grid container spacing={2}>
        <Grid item md={9}>
          <Box mt={2}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mb: 1,
              }}
            >
              <Tooltip title="Save Dirndl" arrow>
                <Button
                  variant="contained"
                  onClick={() => handleSaveDirndl(false)}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <SaveOutlinedIcon />
                </Button>
              </Tooltip>
            </Box>
            {/* Top*/}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Top of the Dirndl</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box
                    component="img"
                    src={topImage}
                    alt="Top"
                    sx={{ width: 100, marginRight: 2 }}
                  />
                  <Box>
                    <Typography variant="body2">
                      Choose a color for the top
                    </Typography>
                    <Box display="flex" justifyContent="center" mb={1}>
                      {renderColorOptions(topColor, setTopColor)}
                    </Box>
                    <Typography variant="body2">
                      Choose a pattern for the top
                    </Typography>
                    <Box display="flex" justifyContent="center">
                      {renderPatternOptions(topPattern, setTopPattern)}
                    </Box>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Skirt */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Skirt of the Dirndl</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box
                    component="img"
                    src={skirtImage}
                    alt="Skirt"
                    sx={{ width: 100, marginRight: 2 }}
                  />
                  <Box>
                    <Typography variant="body2">
                      Choose a color for the skirt
                    </Typography>
                    <Box display="flex" justifyContent="center" mb={1}>
                      {renderColorOptions(bottomColor, setBottomColor)}
                    </Box>
                    <Typography variant="body2">
                      Choose a pattern for the skirt
                    </Typography>
                    <Box display="flex" justifyContent="center">
                      {renderPatternOptions(bottomPattern, setBottomPattern)}
                    </Box>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
            {/* Apron */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Apron of the Dirndl</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box
                    component="img"
                    src={apronImage}
                    alt="Apron"
                    sx={{ width: 100, marginRight: 2 }}
                  />
                  <Box>
                    <Typography variant="body2">
                      Choose a color for the apron
                    </Typography>
                    <Box display="flex" justifyContent="center" mb={1}>
                      {renderColorOptions(apronColor, setApronColor)}
                    </Box>
                    <Typography variant="body2">
                      Choose a pattern for the apron
                    </Typography>
                    <Box display="flex" justifyContent="center">
                      {renderPatternOptions(apronPattern, setApronPattern)}
                    </Box>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Grid>
        <Grid item md={3}>
          <Box
            ref={dirndlRef}
            sx={{
              position: "relative",
              width: "500px",
              height: "250px",
              paddingBottom: "100%",
            }}
          >
            {/* Farb- und Musterschicht */}
            <SvgComponent
              config={config}
              topColor={topColor}
              bottomColor={bottomColor}
              apronColor={apronColor}
              topPattern={topPattern}
              bottomPattern={bottomPattern}
              apronPattern={apronPattern}
            />

            {/* Dirndl-Schablone-Schicht */}
            <img
              src={getSchablone(config)}
              alt="Dirndl Schatten"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "500px",
                height: "500px",
                zIndex: 3,
                objectFit: "contain",
              }}
            />
            {/* Knöpfe-Schablone-Schicht */}
            <img
              src={getKnoepfe(config)}
              alt="Knöpfe"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "500px",
                height: "500px",
                zIndex: 4,
                objectFit: "contain",
              }}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
