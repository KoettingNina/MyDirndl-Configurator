import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";

import InfoIcon from "@mui/icons-material/Info";
import { useAuth } from "../authentication/AuthContext";

const statusInfo = {
  Open: 'You received an order :) \nOrders with an "OPEN" Status are waiting to be processed by you. ',
  Processing:
    'The "Processing" status means that you are currently working on the dirndl.',
  Shipped:
    "Nice :) \nYou have finished and shipped the dirndl and it is on the way to the customer. ",
  Done: 'Your order has been delivered. \nYou can see your finished dirndls under "My Dirndl"',
};

const ProgressStepper = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: "40px",
        justifyContent: "center",
        marginTop: "60px",
      }}
    >
      <Typography variant="h5" color="primary" sx={{ marginRight: "20px" }}>
        Process Steps are:
      </Typography>
      <div style={{ display: "flex", alignItems: "center" }}>
        {["Open", "Processing", "Shipped", "Done"].map((step, index, array) => (
          <React.Fragment key={step}>
            <div
              style={{
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100px",
                height: "40px",
                borderRadius: 5,
                backgroundColor: "#fff",
                border: "2px solid #6F0A21",
                fontWeight: "bold",
                fontSize: "14px",
                color: "#6F0A21",
                margin: "0 5px",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              {step}

              <Tooltip
                title={
                  <span style={{ whiteSpace: "pre-wrap" }}>
                    {statusInfo[step]}
                  </span>
                }
                arrow
              >
                <InfoIcon
                  color="primary"
                  style={{
                    position: "absolute",
                    bottom: "-10px",
                    right: "-10px",
                    cursor: "pointer",
                    backgroundColor: "white",
                  }}
                />
              </Tooltip>
            </div>

            <Box
              sx={{
                position: "absolute",
                bottom: 4,
                right: 4,
              }}
            ></Box>

            {index < array.length - 1 && (
              <span
                style={{
                  margin: "0 10px",
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#6F0A21",
                }}
              >
                →{/* •••→ */}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// Function to set the color based on the status
const getStatusColor = (status) => {
  switch (status) {
    case "Open":
      return "darkred";
    case "Processing":
      return "orange";
    case "Shipped":
      return "darkred";
    default:
      return "gray";
  }
};

// Function to give back the variant based on the status. Important for the button
const getStatusVariant = (status) => {
  switch (status) {
    //case "":
    case "Open":
    case "Processing":
      return "contained";
    default:
      return "outlined";
  }
};

const TailorItemsPage = () => {
  // Get the tailor data using the useAuth hook
  const { tailor } = useAuth();

  // State to manage the list of order items
  const [orderItems, setOrderItems] = useState([]);

  // State to manage the visibility of a general dialog
  const [openDialog, setOpenDialog] = useState(false);

  // State to manage the selected order for dialog display
  const [selectedOrder, setSelectedOrder] = useState(null);

  // State to manage the visibility of the "View More" dialog
  const [openViewMoreDialog, setOpenViewMoreDialog] = useState(false);

  // State to manage the status update
  const [statusUpdate, setStatusUpdate] = useState(0);

  // Function to fetch order items data from the server
  const fetchData = async (tailor) => {
    try {
      // Construct the API endpoint URL
      const url = `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/tailors/items/${tailor}`;

      // Make a GET request to fetch the order items
      const response = await axios.get(url, { withCredentials: true });
      const itemIDs = response.data;

      // Map over the item IDs to fetch details for each order item
      const itemPromises = itemIDs.map(async (id) => {
        const itemResponse = await axios.get(
          `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/orderItem/item/${id}`,
          { withCredentials: true }
        );
        const orderItem = itemResponse.data.orderItem;

        // Fetch measurement data for the order item
        const measurementResponse = await axios.get(
          `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/customerMeasurements/get/${orderItem.customerMeasurement}`,
          { withCredentials: true }
        );
        const measurementData = measurementResponse.data.measurement;

        // Fetch dirndl data for the order item
        const dirndlResponse = await axios.get(
          `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/dirndl/get/${orderItem.dirndl}`,
          { withCredentials: true }
        );
        const dirndlData = dirndlResponse.data;

        // Fetch order data for the order item
        const orderResponse = await axios.get(
          `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/order/${orderItem.order}`,
          { withCredentials: true }
        );
        const orderData = orderResponse.data;

        // Combine all fetched data into a single object and return it
        return {
          ...orderItem,
          measurementData: measurementData,
          dirndlData: dirndlData,
          orderData: orderData,
        };
      });

      // Wait for all promises to resolve and update the state with the processed items
      const processedItems = await Promise.all(itemPromises);
      setOrderItems(processedItems);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // useEffect hook to fetch order items when the component mounts or when statusUpdate or tailor changes
  useEffect(() => {
    if (tailor) {
      fetchData(tailor);
    }
  }, [statusUpdate || tailor]);

  // Function to update the status of an order item
  const updateStatusOnClick = async (orderItemId) => {
    try {
      // Make a POST request to update the order item status
      const changedResponse = await axios.post(
        `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/tailors/orderItem/${orderItemId}`,
        {},
        { withCredentials: true }
      );
      if (changedResponse.status === 200) {
        // Update the statusUpdate state to trigger a re-fetch
        setStatusUpdate(statusUpdate + 1);
      } else {
        console.error("Error updating status:", changedResponse);
      }
    } catch (error) {
      console.error("Error updating or fetching status:", error);
    }
  };

  // Function to open the dialog and set the selected order
  const handleOpenDialog = (orderItem) => {
    setSelectedOrder(orderItem);
    setOpenDialog(true);
  };

  // Function to close the dialog and clear the selected order
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
  };

  // Function to open the "View More" dialog and set the selected order
  const handleViewMore = (orderItem) => {
    setSelectedOrder(orderItem);
    setOpenViewMoreDialog(true);
  };

  // Function to close the "View More" dialog and clear the selected order
  const handleCloseViewMoreDialog = () => {
    setOpenViewMoreDialog(false);
    setSelectedOrder(null);
  };

  // Function to render a row of information with a label and value
  const renderInfoRow = (label, value) => (
    <Box display="flex" alignItems="center" marginBottom="10px" padding="5px">
      <Typography
        variant="body2"
        style={{
          fontWeight: "bold",
          marginRight: "10px",
          textAlign: "right",
          flex: 1,
        }}
      >
        {label}:
      </Typography>
      <Box
        component="span"
        sx={{
          flex: 2,
          backgroundColor: "#f0f0f0",
          padding: "5px 10px",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      >
        <Typography variant="body2">{value}</Typography>
      </Box>
    </Box>
  );

  // Function to render a color box with a label and color value
  const renderColorBox = (label, color) => (
    <Box display="flex" alignItems="center" marginBottom="10px" padding="5px">
      <Typography
        variant="body2"
        style={{
          fontWeight: "bold",
          marginRight: "10px",
          textAlign: "right",
          width: "150px",
        }}
      >
        {label}:
      </Typography>
      <Box
        sx={{
          width: 20,
          height: 20,
          backgroundColor: color,
          borderRadius: "4px",
          border: "1px solid #ccc",
          marginLeft: "10px",
        }}
      />
    </Box>
  );

  // Function to render a pattern image with a label and pattern URL
  const renderPatternImage = (label, patternUrl) => (
    <Box display="flex" alignItems="center" marginBottom="10px" padding="5px">
      <Typography
        variant="body2"
        style={{
          fontWeight: "bold",
          marginRight: "10px",
          textAlign: "right",
          width: "150px",
        }}
      >
        {label}:
      </Typography>
      {patternUrl ? (
        <img
          src={patternUrl}
          alt={label}
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            marginLeft: "10px",
          }}
        />
      ) : (
        <Typography variant="body2" style={{ marginLeft: "10px" }}>
          No pattern
        </Typography>
      )}
    </Box>
  );

  return (
    <div>
      <ProgressStepper />
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          marginTop: "20px",
          width: "80%",
          padding: "10px",
          margin: "0 auto",
        }}
      >
        {/*console.log("OrderItems: ", orderItems)*/}
        {orderItems.map((orderItem) => (
          <Card
            key={orderItem._id}
            style={{
              display: "flex",
              marginBottom: "20px",
              width: "75%",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.3s, box-shadow 0.3s",
            }}
          >
            <CardMedia
              component="img"
              style={{
                flex: 0.3,
                borderRadius: "5px",
                overflow: "hidden",
                margin: "5px",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
              }}
              image={`http://${process.env.REACT_APP_BACKEND_URL}:8080${orderItem.dirndlData.image}`}
              alt="Product"
            />
            <CardContent
              style={{
                flex: 0.7,
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                borderRadius: "5px",
                margin: "5px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "stretch",
              }}
            >
              <Typography sx={{ mb: 1 }} color="primary">
                ORDER {orderItem.product}
              </Typography>

              {orderItem.orderData.customerAccount ? (
                <div style={{ flex: 1, width: "100%" }}>
                  <Typography
                    variant="body2"
                    style={{ fontSize: "10px", margin: "2px 0" }}
                  >
                    Name: {orderItem.orderData.customerAccount.lastName},{" "}
                    {orderItem.orderData.customerAccount.firstName}
                  </Typography>

                  <Typography
                    variant="body2"
                    style={{ fontSize: "10px", margin: "2px 0" }}
                  >
                    Address:{" "}
                    {
                      orderItem.orderData.customerAccount.deliveryAddress
                        .address1
                    }
                  </Typography>
                  <Typography
                    variant="body2"
                    style={{ fontSize: "10px", margin: "2px 0" }}
                  >
                    Zip Code:{" "}
                    {orderItem.orderData.customerAccount.deliveryAddress.zip}
                  </Typography>
                  <Typography
                    variant="body2"
                    style={{ fontSize: "10px", margin: "2px 0" }}
                  >
                    City:{" "}
                    {orderItem.orderData.customerAccount.deliveryAddress.city}
                  </Typography>
                </div>
              ) : (
                <Typography>Loading...</Typography>
              )}

              <Typography variant="body2" sx={{ mt: 2 }} color="primary">
                Customer Measurements:
              </Typography>
              {orderItem.measurementData ? (
                <div>
                  <Typography
                    variant="body2"
                    style={{ fontSize: "10px", margin: "2px 0" }}
                  >
                    Height: {orderItem.measurementData.height} cm
                  </Typography>
                  <Typography
                    variant="body2"
                    style={{ fontSize: "10px", margin: "2px 0" }}
                  >
                    Bust Size: {orderItem.measurementData.bustSize} cm
                  </Typography>
                  <Typography
                    variant="body2"
                    style={{ fontSize: "10px", margin: "2px 0" }}
                  >
                    Waist Size: {orderItem.measurementData.waistSize} cm
                  </Typography>
                  <Typography
                    variant="body2"
                    style={{ fontSize: "10px", margin: "2px 0" }}
                  >
                    Hip Size: {orderItem.measurementData.hipSize} cm
                  </Typography>
                </div>
              ) : (
                <Typography>Loading...</Typography>
              )}

              <Button
                onClick={() => handleViewMore(orderItem)}
                variant="text"
                style={{
                  fontSize: "10px",
                  marginTop: "10px",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
              >
                View More...
              </Button>
            </CardContent>

            <CardContent
              style={{
                flex: 0.3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "5px",
              }}
            >
              <Button
                onClick={() => handleOpenDialog(orderItem)}
                style={{
                  padding: "10px 20px",
                  fontWeight: "bold",
                  border: "2px solid", // Set border width

                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  width: "160px",
                  backgroundColor:
                    getStatusVariant(orderItem.status) === "contained"
                      ? getStatusColor(orderItem.status)
                      : "transparent", // Set background color for 'contained'
                  color:
                    getStatusVariant(orderItem.status) === "contained"
                      ? "#fff"
                      : getStatusColor(orderItem.status), // Text color based on variant
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow =
                    "0px 6px 12px rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0px 4px 8px rgba(0, 0, 0, 0.1)";
                }}
              >
                {orderItem.status}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedOrder && (
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Order Status</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to change the status of order #
              {selectedOrder._id}?
            </Typography>
            <Typography color="primary">This step cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Cancel
            </Button>
            <Button
              onClick={() => {
                updateStatusOnClick(selectedOrder._id);
                handleCloseDialog();
              }}
              color="primary"
              variant="contained"
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Dialog for ViewMore Details */}
      {selectedOrder && (
        <Dialog
          open={openViewMoreDialog}
          onClose={handleCloseViewMoreDialog}
          fullWidth
        >
          {console.log(selectedOrder)}
          <DialogTitle color="primary">Order Details</DialogTitle>
          <DialogContent>
            <Box sx={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}>
              <Typography
                variant="h6"
                color="primary"
                style={{ marginTop: "20px" }}
              >
                Dirndl Information:
              </Typography>
              {renderInfoRow("Length", `${selectedOrder.dirndlData.Length}`)}
              {renderInfoRow("Neck", `${selectedOrder.dirndlData.Neck}`)}

              {renderColorBox("Top Color", selectedOrder.dirndlData.topColor)}
              {renderColorBox(
                "Bottom Color",
                selectedOrder.dirndlData.bottomColor
              )}
              {renderColorBox(
                "Apron Color",
                selectedOrder.dirndlData.apronColor
              )}
              {renderPatternImage(
                "Top Pattern",
                selectedOrder.dirndlData.topPattern
              )}
              {renderPatternImage(
                "Bottom Pattern",
                selectedOrder.dirndlData.bottomPattern
              )}
              {renderPatternImage(
                "Apron Pattern",
                selectedOrder.dirndlData.apronPattern
              )}
              <Typography
                variant="h6"
                color="primary"
                style={{ marginTop: "20px" }}
              >
                Customer Information:
              </Typography>
              {renderInfoRow(
                "Customer",
                `${selectedOrder.orderData.customerAccount.lastName}, ${selectedOrder.orderData.customerAccount.firstName}`
              )}
              {renderInfoRow(
                "Address 1",
                selectedOrder.orderData.customerAccount.deliveryAddress.address1
              )}
              {renderInfoRow(
                "Address 2",
                selectedOrder.orderData.customerAccount.deliveryAddress.address2
              )}
              {renderInfoRow(
                "Zip code",
                selectedOrder.orderData.customerAccount.deliveryAddress.zip
              )}
              {renderInfoRow(
                "City",
                selectedOrder.orderData.customerAccount.deliveryAddress.city
              )}
              {renderInfoRow(
                "State",
                selectedOrder.orderData.customerAccount.deliveryAddress.state
              )}
              {renderInfoRow(
                "Country",
                selectedOrder.orderData.customerAccount.deliveryAddress.country
              )}
              {renderInfoRow(
                "Phone Number",
                `+${selectedOrder.orderData.customerAccount.deliveryAddress.phonePrefix} ${selectedOrder.orderData.customerAccount.deliveryAddress.phone}`
              )}

              <Typography
                variant="h6"
                color="primary"
                style={{ marginTop: "20px" }}
              >
                Customer Measurements:
              </Typography>
              {renderInfoRow(
                "Height",
                `${selectedOrder.measurementData.height} cm`
              )}
              {renderInfoRow(
                "Bust Size",
                `${selectedOrder.measurementData.bustSize} cm`
              )}
              {renderInfoRow(
                "Waist Size",
                `${selectedOrder.measurementData.waistSize} cm`
              )}
              {renderInfoRow(
                "Hip Size",
                `${selectedOrder.measurementData.hipSize} cm`
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseViewMoreDialog} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default TailorItemsPage;
