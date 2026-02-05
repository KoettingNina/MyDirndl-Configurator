import React from "react";
import {Box, Typography, Button} from "@mui/material";
import banner from "../images/banner.jpg";
import tailorBanner from "../images/tailorBanner.webp";
import dirndlIcon from "../images/dirndl.png";
import tailorIcon from "../images/suit.png";
import {Link, useLocation} from "react-router-dom";
import ReviewPage from "../components/Review";
import {useAuth} from "../authentication/AuthContext";

const HomePage = () => {
    const {user} = useAuth();
    return (
        <div>
            <Box
                sx={{
                    height: "300px",
                    backgroundImage: `url(${banner})`,
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
                        MY DIRNDL
                    </Typography>
                    <Typography
                        component="div"
                        gutterBottom
                        sx={{mb: 3}}
                        color="secondary"
                    >
                        Personalize your own Dirndl, for your next special occasion!
                    </Typography>
                    <Link to="/configuration">
                        <Button
                            variant="contained"
                            sx={{
                                "&:hover": {
                                    backgroundColor: "#6F0A21",
                                    opacity: 0.7,
                                },
                            }}
                        >
                            <img src={dirndlIcon} width="35px" padding="10px"/>
                            Get started
                        </Button>
                    </Link>
                </Box>
            </Box>
            <ReviewPage/>
            {!user && (
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
                    mb: 10,
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
                        OUR TAILOR
                    </Typography>
                    <Typography
                        component="div"
                        gutterBottom
                        sx={{mb: 3}}
                        color="secondary"
                    >
                        Become one of our tailors and create the desired dirndl!
                    </Typography>
                    <Link to="/login" state={{tabValue: "tailor"}}>
                        <Button
                            variant="contained"
                            sx={{
                                "&:hover": {
                                    backgroundColor: "#6F0A21",
                                    opacity: 0.7,
                                },
                            }}
                        >
                            <img
                                src={tailorIcon}
                                width="35px"
                                padding="10px"
                                style={{marginRight: "8px"}}
                            />
                            Become a tailor
                        </Button>
                    </Link>
                </Box>
            </Box>
            )}
        </div>
    );
};

export default HomePage;
