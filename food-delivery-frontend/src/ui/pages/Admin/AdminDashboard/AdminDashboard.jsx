import React from 'react';
import {Typography, Grid, Card, CardContent, Button, Box} from "@mui/material";
import {Link} from "react-router";
import PeopleIcon from '@mui/icons-material/People';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FastfoodIcon from '@mui/icons-material/Fastfood';

const AdminDashboard = () => {
    return (
        <Box
            data-testid="admin-dashboard-page"
            sx={{
            display: "flex",                 // enable flexbox
            flexDirection: "column",         // stack header + grid vertically
            alignItems: "center",            // horizontal center
            justifyContent: "center",        // vertical center
            textAlign: "center",             // center text inside

        }}>
            <Typography variant="h4" sx={{ mb: 3 }}>
                Admin Dashboard
            </Typography>

            <Grid container spacing={3} justifyContent="center" >
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <PeopleIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h5" gutterBottom>
                                User Management
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Manage users, roles, and permissions
                            </Typography>
                            <Button
                                data-testid="admin-manage-users-btn"
                                variant="contained"
                                component={Link}
                                to="/admin/users"
                                fullWidth
                            >
                            Manage Users
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <RestaurantIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h5" gutterBottom>
                                Restaurant Management
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Add, edit, and manage restaurants
                            </Typography>
                            <Button
                                data-testid="admin-manage-restaurants-btn"
                                variant="contained"
                                component={Link}
                                to="/admin/restaurants"
                                fullWidth
                            >
                            Manage Restaurants
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <FastfoodIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h5" gutterBottom>
                                Product Management
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Manage menu items and products
                            </Typography>
                            <Button
                                data-testid="admin-manage-products-btn"
                                variant="contained"
                                component={Link}
                                to="/admin/products"
                                fullWidth
                            >
                            Manage Products
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;