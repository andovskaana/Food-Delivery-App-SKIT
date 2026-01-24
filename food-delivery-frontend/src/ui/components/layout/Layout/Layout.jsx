import React from 'react';
import { Box, Container } from "@mui/material";
import Header from "../Header/Header.jsx";
import { Outlet, useLocation } from "react-router";
import "./Layout.css";
import Footer from "../Footer/Footer.jsx";

const Layout = () => {
    const location = useLocation();

    // Paths where footer should NOT appear
    const noFooterPaths = [
        "/login",
        "/register",
        "/admin",
        "/courier",
        "/user/me",
        "/forgot-password"
    ];

    const hideFooter = noFooterPaths.some(path =>
        location.pathname.startsWith(path)
    );

    return (
        <Box
            data-testid="app-layout"
            className="layout-box"
        >
            <Header />

            <Container
                data-testid="layout-outlet"
                className="outlet-container"
                sx={{ my: 2 }}
                maxWidth="lg"
            >
                <Outlet />
            </Container>

            {!hideFooter && <Footer />}
        </Box>
    );
};

export default Layout;
