import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Box,
  Card,
  CardActions,
  Container,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authentication/AuthContext.js";

const InspirationPage = () => {
  const [posts, setPosts] = useState([]);
  const [sortBy, setSortBy] = useState("likes");
  const [order, setOrder] = useState("desc");
  const [likedPosts, setLikedPosts] = useState([]);
  const navigate = useNavigate();

  const { user } = useAuth();
  const customerId = user;

  useEffect(() => {
    fetchUserData();
    fetchInspirations();
  }, [sortBy, order]);

  const fetchUserData = async () => {
    try {
      //get the favoriteList of the user to set the liked Posts as liked
      const response = await axios.get(
        `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/customers/favoriteList/${customerId}`,
        { withCredentials: true }
      );
      const likedIds = response.data.map((post) => post._id); // Extract post IDs from response
      setLikedPosts(likedIds);
    } catch (error) {
      console.error("Error fetching posts", error);
    }
  };

  // Fetch inspiration posts
  const fetchInspirations = async () => {
    try {
      //get all inspirationPost can be sorted by likes/creation Date and ascending and descending
      const response = await axios.get(
        `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/inspirationPosts/all?sortBy=${sortBy}&order=${order}`,
        { withCredentials: true }
      );
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts", error);
    }
  };

  // Handle liking an inspiration post
  const likeInspiration = async (id) => {
    if (user) {
      try {
        //inspirationPost gets a like -> update the amount of likes
        await axios.post(
          `http://${process.env.REACT_APP_BACKEND_URL}:8080/api/inspirationPosts/${id}/like`,
          {
            customerId: customerId,
          }, // Pass the userId to update the favoriteList of the user
          { withCredentials: true }
        );
        fetchUserData(); // Fetch updated user data
        fetchInspirations(); // Fetch updated inspiration posts
      } catch (error) {
        console.error("Error fetching posts", error);
      }
    } else {
      navigate("/login");
    }
  };

  // Toggle the sorting order
  const toggleOrder = () => {
    setOrder(order === "asc" ? "desc" : "asc"); // Toggle between ascending and descending order
  };

  // Handle using a design from an inspiration post
  const handleUseThisDesign = (inspiration) => {
    const dirndl = inspiration.orderItemConnection?.dirndl; // Get the dirndl design from the inspiration post

    if (dirndl) {
      navigate("/configuration", { state: { design: dirndl, step: 2 } }); // Navigate to the configuration page with the design data
    } else {
      console.error("Dirndl not found for the selected inspiration");
    }
  };

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
        WHAT OTHERS BOUGHT RECENTLY
      </Typography>
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
        <IconButton onClick={toggleOrder} sx={{ mt: 3 }}>
          {order === "asc" ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
        </IconButton>
        <FormControl variant="standard" margin="normal">
          <InputLabel id="sort-label">Sort By</InputLabel>
          <Select
            labelId="sort-label"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            label="Sort By"
          >
            <MenuItem value="likes">Likes</MenuItem>
            <MenuItem value="createdAt">Date</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Grid container spacing={4}>
        {posts.map((inspiration) => (
          <Grid item key={inspiration._id} xs={12} sm={6} md={4}>
            <Card>
              <CardMedia
                component="img"
                alt="Inspiration"
                height="250"
                sx={{ objectFit: "contain" }}
                image={`http://${process.env.REACT_APP_BACKEND_URL}:8080/${inspiration.wornPicture}`}
              />

              <CardActions
                sx={{ display: "flex", alignItems: "center" }}
                disableSpacing
              >
                <IconButton onClick={() => likeInspiration(inspiration._id)}>
                  {likedPosts.includes(inspiration._id) ? (
                    //when the likedPosts include the Post then it is a filled heart in read
                    <FavoriteIcon color="primary" />
                  ) : (
                    //otherwise it is a border of a heart
                    <FavoriteBorderIcon />
                  )}
                </IconButton>
                <Typography variant="body2" color="textSecondary" component="p">
                  {/* amount of likes the post has */}
                  {`${inspiration.likes}`}
                </Typography>
                <div style={{ flexGrow: 1 }} />
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  onClick={() => handleUseThisDesign(inspiration)}
                >
                  Use this design
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default InspirationPage;
