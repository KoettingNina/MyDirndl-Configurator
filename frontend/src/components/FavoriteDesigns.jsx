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
import FavoriteIcon from "@mui/icons-material/Favorite";

const FavoriteDesigns = ({ customerId }) => {
  const [favoriteDesigns, setFavoriteDesigns] = useState([]); // State to store favorite designs
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [designToDeleteId, setDesignToDeleteId] = useState(null); // State to store the design ID to be deleted

  // Fetch favorite designs on component mount
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await axios.get(
          `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/customers/favoriteList/${customerId}`,
          { withCredentials: true }
        );

        setFavoriteDesigns(response.data);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, [customerId]);

  // Navigate to the configuration page with the selected design
  const handleUseDesign = (design) => {
    navigate("/configuration", { state: { design, step: 2 } });
  };

  // Handle deleting a favorite design from favoriteList of customer
  const handleDeleteFavorite = async (inspirationId) => {
    try {
      await axios.put(
        `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/customers/removeFavorite/${customerId}`,
        { favoriteItem: inspirationId },
        { withCredentials: true }
      );
      // Remove the deleted design from the state
      setFavoriteDesigns(
        (prevFavorites) =>
          prevFavorites.filter((fav) => fav._id !== inspirationId) // Filter out the deleted favorite
      );
      handleCloseDialog();
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  // Open the confirmation dialog for deleting a design
  const handleOpenDialog = (designId) => {
    setDesignToDeleteId(designId); // Set the design ID to be deleted

    setOpenDialog(true); // Clear the design ID to be deleted
  };

  // Close the confirmation dialog
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
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom color="primary">
        YOUR FAVORITE DESIGNS
      </Typography>

      {favoriteDesigns.length === 0 && (
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
            You have no liked designs. Start{" "}
            <Link
              to="/inspiration"
              style={{
                textDecoration: "underline",
                color: "primary",
              }}
            >
              here
            </Link>{" "}
            to like your first post.
          </Typography>
        </Box>
      )}

      <Grid container spacing={2}>
        {favoriteDesigns.map((favorite) => (
          <Grid item xs={12} md={4} key={favorite._id}>
            {console.log("favoriteDesigns", favoriteDesigns)}
            <Card
              sx={{
                padding: "20px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <CardMedia
                component="img"
                alt="Favorite Design"
                sx={{ height: "250px", objectFit: "contain" }}
                image={`http://${process.env.REACT_APP_BACKEND_URL}:8080/${favorite.wornPicture}`}
              />
              <Box display="flex" justifyContent="flex-end" width="100%" mt={1}>
                <IconButton
                  onClick={() => handleOpenDialog(favorite._id)}
                  color="primary"
                >
                  <FavoriteIcon />
                </IconButton>
                {console.log("favorite", favorite)}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() =>
                    handleUseDesign(favorite.orderItemConnection.dirndl)
                  }
                >
                  Use This Design
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Remove from Favorites Confirmation"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to remove this design from your favorites?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          {console.log("designToDeleteId", designToDeleteId)}
          <Button
            onClick={() => handleDeleteFavorite(designToDeleteId)}
            variant="contained"
            color="primary"
            autoFocus
          >
            Unlike
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FavoriteDesigns;
