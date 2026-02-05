import React from "react";
import { Box, Typography, Button, Grid, Paper } from "@mui/material";
import banner from "../images/banner.jpg";
import tailorBanner from "../images/tailorBanner.webp";
import dirndlIcon from "../images/dirndlIconRed.png";
import tailorIcon from "../images/suitDarkred.png";
import { Link } from "react-router-dom";
import ReviewPage from "../components/Review";

const TailorHomepage = () => {
    return (
        <div>
            <Box
                sx={{
                    height: "300px",
                    backgroundImage: `url(${tailorBanner})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    padding: "50px",
                }}
            >
                <Box
                    sx={{
                        padding: "20px",
                        color: "white",
                        maxWidth: "300px",
                        textAlign: "center",
                    }}
                >
                    <Typography
                        variant="h4"
                        component="div"
                        gutterBottom
                        color="secondary"
                    >
                        Welcome to
                    </Typography>
                    <Typography
                        variant="h4"
                        component="div"
                        gutterBottom
                        color="primary"
                    >
                        MY DIRNDL!
                    </Typography>
                    <Typography
                        component="div"
                        gutterBottom
                        sx={{ mb: 3 }}
                        color="secondary"
                    >
                        You are an important part of our team. Thank you for your hard work!
                    </Typography>
                </Box>
            </Box>
            <Box sx={{ padding: "20px" }}>
                <Typography
                    variant="h4"
                    component="div"
                    gutterBottom
                    align="center"
                    color="primary"
                >
                    This is your space for managing your new and existing orders.
                </Typography>
                <Grid container spacing={4} sx={{ marginTop: "20px" }}>
                    <Grid item xs={6} sm={12} md={6}>
                        <Box sx={{ padding: "20px", textAlign: "center", boxShadow:"0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)"  }}>
                            <img src={dirndlIcon} alt="Dirndl Icon" style={{ width: "100px" }} />
                            <Typography variant="h6" component="div" gutterBottom>
                                My Dirndl
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                Revisit your finished Dirndls. You have done an immaculate job!
                            </Typography>
                            <Button variant="contained" color="primary" component={Link} to="/itemsFinished">
                                MY DIRNDL
                            </Button>
                        </Box>
                    </Grid>
                    <Grid item xs={6} sm={12} md={6}>
                        <Box sx={{padding: "20px", textAlign: "center", boxShadow:"0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)"  }}>
                            <img
                                src={tailorIcon}
                                width="100px"
                            />
                            <Typography variant="h6" component="div" gutterBottom>
                                My Orders
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                View your orders and manage them here.
                            </Typography>
                            <Button variant="contained" color="primary" component={Link} to="/tailorItems">

                                MY ORDERS
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </div>
    );
};

export default TailorHomepage;