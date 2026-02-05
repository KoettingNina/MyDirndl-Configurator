import axios from "axios";
import { useAuth } from "../authentication/AuthContext";
import { useState, useEffect } from "react";
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

const ItemsFinishedPage = () => {
  // Get the tailor data using the useAuth hook
  const { tailor } = useAuth();

  // State to manage the list of finished items
  const [finishedItemsState, setFinishedItemsState] = useState([]);

  // State to manage the selected order for dialog display
  const [selectedOrder, setSelectedOrder] = useState(null);

  // State to manage the visibility of the "View More" dialog
  const [openViewMoreDialog, setOpenViewMoreDialog] = useState(false);

  // State to manage the visibility of a general dialog
  const [openDialog, setOpenDialog] = useState(false);

  // Function to fetch finished items data from the server
  const fetchFinishedItems = async (tailor) => {
    try {
      // Construct the API endpoint URL to get all finished items for the tailor (Meaning their status is set to "Done")
      const url = `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/tailors/finishedItems/${tailor}`;

      // Make a GET request to fetch the finished items
      const response = await axios.get(url, { withCredentials: true });
      const itemIDs = response.data;

      // Map over the item IDs to fetch details for each finished item
      const itemPromises = itemIDs.map(async (id) => {
        const itemResponse = await axios.get(
          `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/orderItem/item/${id}`,
          { withCredentials: true }
        );
        const finishedItem = itemResponse.data.orderItem;

        // Fetch measurement data for the finished item
        const measurementResponse = await axios.get(
          `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/customerMeasurements/get/${finishedItem.customerMeasurement}`,
          { withCredentials: true }
        );
        const measurementData = measurementResponse.data.measurement;

        // Fetch dirndl data for the finished item
        const dirndlResponse = await axios.get(
          `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/dirndl/get/${finishedItem.dirndl}`,
          { withCredentials: true }
        );
        const dirndlData = dirndlResponse.data;

        // Fetch order data for the finished item
        const orderResponse = await axios.get(
          `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/order/${finishedItem.order}`,
          { withCredentials: true }
        );
        const orderData = orderResponse.data;

        // Combine all fetched data into a single object and return it
        return {
          ...finishedItem,
          measurementData: measurementData,
          dirndlData: dirndlData,
          orderData: orderData,
        };
      });

      // Wait for all promises to resolve and update the state with the finished items
      const finishedItems = await Promise.all(itemPromises);
      console.log("The finished items are: ", finishedItems);
      setFinishedItemsState(finishedItems);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Function to open the dialog and set the selected order
  const handleOpenDialog = (finishedItem) => {
    setSelectedOrder(finishedItem);
    setOpenDialog(true);
  };

  // Function to close the dialog and clear the selected order
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
  };

  // Function to open the "View More" dialog and set the selected order
  const handleViewMore = (finishedItem) => {
    setSelectedOrder(finishedItem);
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

  // useEffect hook to fetch finished items when the component mounts or when the tailor value changes
  useEffect(() => {
    if (tailor) {
      fetchFinishedItems(tailor);
    }
  }, [tailor]);

  return (
    <div style={{ marginTop: "60px", color: "#6F0A21" }}>
      <h1 style={{ textAlign: "center" }}>Your Finished Items</h1>
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
        {finishedItemsState.map((finishedItem) => (
          <Card
            key={finishedItem._id}
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
              image={`http://${process.env.REACT_APP_BACKEND_URL}:8080${finishedItem.dirndlData.image}`}
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
                ORDER {finishedItem.product}
              </Typography>

              {finishedItem.orderData.customerAccount ? (
                <div style={{ flex: 1, width: "100%" }}>
                  <Typography
                    variant="body2"
                    style={{ fontSize: "10px", margin: "2px 0" }}
                  >
                    Name: {finishedItem.orderData.customerAccount.lastName},{" "}
                    {finishedItem.orderData.customerAccount.firstName}
                  </Typography>

                  <Typography
                    variant="body2"
                    style={{ fontSize: "10px", margin: "2px 0" }}
                  >
                    Address:{" "}
                    {
                      finishedItem.orderData.customerAccount.deliveryAddress
                        .address1
                    }
                  </Typography>
                  <Typography
                    variant="body2"
                    style={{ fontSize: "10px", margin: "2px 0" }}
                  >
                    Zip Code:{" "}
                    {finishedItem.orderData.customerAccount.deliveryAddress.zip}
                  </Typography>
                  <Typography
                    variant="body2"
                    style={{ fontSize: "10px", margin: "2px 0" }}
                  >
                    City:{" "}
                    {
                      finishedItem.orderData.customerAccount.deliveryAddress
                        .city
                    }
                  </Typography>
                </div>
              ) : (
                <Typography>Loading...</Typography>
              )}

              <Typography variant="body2" sx={{ mt: 2 }} color="primary">
                Customer Measurements:
              </Typography>
              {finishedItem.measurementData ? (
                <div>
                  <Typography
                    variant="body2"
                    style={{ fontSize: "10px", margin: "2px 0" }}
                  >
                    Height: {finishedItem.measurementData.height} cm
                  </Typography>
                  <Typography
                    variant="body2"
                    style={{ fontSize: "10px", margin: "2px 0" }}
                  >
                    Bust Size: {finishedItem.measurementData.bustSize} cm
                  </Typography>
                  <Typography
                    variant="body2"
                    style={{ fontSize: "10px", margin: "2px 0" }}
                  >
                    Waist Size: {finishedItem.measurementData.waistSize} cm
                  </Typography>
                  <Typography
                    variant="body2"
                    style={{ fontSize: "10px", margin: "2px 0" }}
                  >
                    Hip Size: {finishedItem.measurementData.hipSize} cm
                  </Typography>
                </div>
              ) : (
                <Typography>Loading...</Typography>
              )}

              <Button
                onClick={() => handleViewMore(finishedItem)}
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
                //variant="contained"
                style={{
                  padding: "10px 20px",
                  fontWeight: "bold",
                  border: "2px solid", // Set border width

                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  width: "160px",
                  backgroundColor: "darkgreen",
                  color: "white",
                }}
              >
                {finishedItem.status}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
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

export default ItemsFinishedPage;
