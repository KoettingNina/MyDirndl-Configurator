import React, { useEffect, useState } from "react";
import guide from "../../images/measurements.png";
import { Box, Button } from "@mui/material";
import MeasurementForm from "./MeasurementForm";
import axios from "axios";
import { useAuth } from "../../authentication/AuthContext";

export default function Measurements(props) {
  const [measurements, setMeasurements] = useState([]);

  const { user } = useAuth();
  const customerId = user;

  const [measurementsAvailable, setMeasurementsAvailable] = useState(false);

  const fetchMeasurements = async () => {
    try {
      if (!customerId) {
        console.log("customerId is null");
        return;
      }
      // get all measurement associated with the current userId from DB
      const response = await axios.get(
        `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/customerMeasurements/getByCustomer/${customerId}`, {withCredentials: true}
      );

      // set measurements available to check if the name select should be shown
      if (response.data.size === 0) {
        console.log("fetched measurements from DB is null");
        setMeasurementsAvailable(false);
      } else {
        console.log("fetched measurements from DB is not null");
        setMeasurementsAvailable(true);
        setMeasurements(response.data);
      }
      console.log("fetched: " + measurements);
    } catch (err) {
      console.log("fetching measurements of this customer went wrong");
    }
  };
  useEffect(() => {
    fetchMeasurements().then((m) => console.log(m));
  }, [user]);

  return (
    <div className="wrapperMeasurements" style={{ display: "flex" }}>
      <div className="measurementPicture" style={{ marginLeft: "100px" }}>
        <img
          src={guide}
          alt="measurement-guide"
          style={{ maxHeight: "500px" }}
        />
      </div>
      <Box className="wrapperMeasurementForm">
        <MeasurementForm
          customerId={customerId}
          measurements={measurements}
          mearuementsAvailable={measurementsAvailable}
          setMeasurements={setMeasurements}
          selected={props.selected}
          setSelected={props.setSelected}
          config={props.config}
          //   unsavedMeasurements={props.unsavedMeasurements}
          setUnsavedMeasurements={props.setUnsavedMeasurements}
        />
      </Box>
    </div>
  );
}
