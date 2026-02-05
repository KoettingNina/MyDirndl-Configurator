import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Grid,
  Typography,
  Container,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import FavoriteDesigns from "./FavoriteDesigns";
import { useAuth } from "../authentication/AuthContext";

const SavedDesigns = () => {
  const { user } = useAuth();
  const customerId = user;
  const [savedDesigns, setSavedDesigns] = useState([]);

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [designToDeleteId, setDesignToDeleteId] = useState(null); // State to store the ID of the design to be deleted

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const response = await axios.get(
          `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/customers/saved/${customerId}`,
          { withCredentials: true }
        );

        setSavedDesigns(response.data); // Set fetched designs to state
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false); //set loading to false after fetch
      }
    };
    fetchSaved();
  }, [customerId]);

  // Navigate to the configuration page with the selected design
  const handleUseDesign = (design) => {
    navigate("/configuration", { state: { design, step: 2 } }); // Navigate to configuration page with design data and step
  };

  // Delete a design
  const handleDeleteDesign = async () => {
    try {
      const response = await axios.delete(
        `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/customers/removeSaved/${customerId}/${designToDeleteId}`,
        { withCredentials: true }
      );
      setSavedDesigns(response.data); // Update saved designs after deletion

      // Call the deleteDirndl function
      await axios.delete(
        `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/dirndl/delete/${designToDeleteId}`,
        { withCredentials: true }
      );
      console.log("Dirndl deleted successfully:", designToDeleteId);
    } catch (error) {
      console.error("Error deleting saved:", error);
    } finally {
      handleCloseDialog();
    }
  };

  const handleOpenDialog = (designId) => {
    setDesignToDeleteId(designId);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDesignToDeleteId(null);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        padding: 2,
        mt: "80px",
      }}
    >
      <Typography variant="h5" gutterBottom color="primary">
        YOUR SAVED DESIGNS
      </Typography>

      {savedDesigns.length === 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100px",
            border: "1px solid lightgray",
            borderRadius: "5px",
            marginBottom: "20px",
          }}
        >
          <Typography variant="body1" color="textSecondary">
            You have no saved designs. Start{" "}
            <Link
              to="/configuration"
              style={{
                textDecoration: "underline",
                color: "primary",
              }}
            >
              here
            </Link>{" "}
            to create your first dirndl.
          </Typography>
        </Box>
      )}
      <Grid container spacing={2}>
        {savedDesigns.map((design) => (
          <Grid item xs={12} md={4} key={`saved-${design._id}`}>
            {console.log("savedDesigns.image", design.image)}
            <Card sx={{ padding: "20px" }}>
              <CardMedia
                component="img"
                alt="Saved Desgin"
                height="100%"
                sx={{ objectFit: "contain" }}
                image={`http://${process.env.REACT_APP_BACKEND_URL}:8080${design.image}`}
              />
              <Box display="flex" justifyContent="flex-end" width="100%" mt={1}>
                <IconButton
                  onClick={() => handleOpenDialog(design._id)}
                  color="primary"
                >
                  <DeleteIcon />
                </IconButton>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleUseDesign(design)}
                >
                  Use This Design
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <FavoriteDesigns sx={{ mb: 2 }} customerId={customerId} />

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Delete Confirmation"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this design?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteDesign}
            variant="contained"
            color="primary"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SavedDesigns;
