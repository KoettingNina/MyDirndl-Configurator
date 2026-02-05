import { Grid, Typography } from "@mui/material";
import React from "react";
import { Card, CardContent, CardMedia, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function CartItem({item, handleRemoveFromCart, checkout}){
    return (
        <Card sx={{ maxWidth: 345 }}>
            <CardMedia
                component="img"
                sx={{objectFit: 'contain', height: 140, width: 140, display: 'block', justfiyContent: 'center', margin: 'auto'}}
                image={`http://${process.env.REACT_APP_BACKEND_URL}:8080${item.dirndl.image}`}
                alt="Dirndl Image"
            />
            <CardContent sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            
            }}>
                <Typography gutterBottom variant="h6" component="div">
                    {item.dirndl.name}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    {item.dirndl.price} €
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Measurements: {item.customerMeasurement.name}
                </Typography>
                <Grid container spacing={1} sx={{marginTop: '0.5rem', justifyContent: 'center', display: 'flex'}}>
                        <Grid item xs={6} sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                               Height: {item.customerMeasurement.height} cm
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                               Bust: {item.customerMeasurement.bustSize} cm
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                               Waist: {item.customerMeasurement.waistSize} cm
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                               Hip: {item.customerMeasurement.hipSize} cm
                            </Typography>
                        </Grid>
                </Grid>
                {!checkout?<IconButton onClick={() => handleRemoveFromCart(item.id)} fullWidth><DeleteIcon color="primary"/></IconButton>:null}
            </CardContent>
        </Card>
    );
}
