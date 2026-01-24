import React from "react";
import { Box, Paper } from "@mui/material";
import "./auth.css";

const AuthLayout = ({ children }) => {
    return (
        <Box
            data-testid="auth-layout"
            className="auth-root"
        >
            {/* Left column / mobile background */}
            <Box
                data-testid="auth-illustration"
                className="auth-illustration"
            />

            {/* Right column (desktop) / centered overlay (mobile) */}
            <Box
                data-testid="auth-form-wrap"
                className="auth-form-wrap"
            >
                <Paper
                    data-testid="auth-card"
                    elevation={4}
                    className="auth-card"
                >
                    {children}
                </Paper>
            </Box>
        </Box>
    );
};

export default AuthLayout;
