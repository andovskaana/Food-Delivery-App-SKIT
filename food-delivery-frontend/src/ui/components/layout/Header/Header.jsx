import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Button
} from "@mui/material";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { Link, useNavigate, useLocation } from "react-router";
import useAuth from "../../../../hooks/useAuth.js";

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Hide header on auth pages
    const hideHeader = /^\/(login|register|forgot-password)(\/|$)/.test(location.pathname);
    if (hideHeader) return null;

    const getDashboardLink = () => {
        if (!user) return null;

        if (user.roles?.includes('ADMIN')) {
            return (
                <Button
                    data-testid="header-admin-link"
                    color="inherit"
                    startIcon={<AdminPanelSettingsIcon />}
                    component={Link}
                    to="/admin"
                >
                    Admin Panel
                </Button>
            );
        }

        if (user.roles?.includes('COURIER')) {
            return (
                <Button
                    data-testid="header-courier-link"
                    color="inherit"
                    startIcon={<DeliveryDiningIcon />}
                    component={Link}
                    to="/courier"
                >
                    Courier Dashboard
                </Button>
            );
        }

        return null;
    };

    return (
        <AppBar
            data-testid="header"
            position="static"
            color="primary"
        >
            <Toolbar sx={{ display: 'flex', gap: 2 }}>
                <RestaurantIcon />

                <Typography
                    data-testid="header-brand"
                    variant="h6"
                    sx={{ flexGrow: 1 }}
                    component={Link}
                    to="/"
                    style={{ color: "#fff", textDecoration: "none" }}
                >
                    Ana2AnaFoodDelivery
                </Typography>

                {user?.roles?.includes('CUSTOMER') && (
                    <>
                        <Button
                            data-testid="header-cart-link"
                            color="inherit"
                            startIcon={<ShoppingCartIcon />}
                            component={Link}
                            to="/cart"
                        >
                            Cart
                        </Button>
                        <Button
                            data-testid="header-orders-link"
                            color="inherit"
                            component={Link}
                            to="/orders/my-orders"
                        >
                            My Orders
                        </Button>
                    </>
                )}

                {getDashboardLink()}

                {user ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                            data-testid="header-profile-btn"
                            color="inherit"
                            onClick={() => navigate(`/user/me`)}
                            sx={{ textTransform: 'none' }}
                        >
                            Hello, {user.username}
                        </Button>
                        <Button
                            data-testid="header-logout-btn"
                            color="inherit"
                            onClick={() => {
                                logout();
                                navigate('/');
                            }}
                        >
                            Logout
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            data-testid="header-login-link"
                            color="inherit"
                            component={Link}
                            to="/login"
                        >
                            Login
                        </Button>
                        <Button
                            data-testid="header-register-link"
                            color="inherit"
                            component={Link}
                            to="/register"
                        >
                            Register
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;
