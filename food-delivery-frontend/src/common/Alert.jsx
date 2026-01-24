import React from "react";
import { Box, Typography, Button } from "@mui/material";

const Alert = ({ open, onClose, message }) => {
    if (!open) return null;

    return (
        <Box
            data-testid="global-alert"
            sx={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                bgcolor: "rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2000,
            }}
        >
            <Box
                sx={{
                    bgcolor: "white",
                    borderRadius: 3,
                    p: 3,
                    maxWidth: 400,
                    width: "90%",
                    textAlign: "center",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
            >
                <Typography sx={{ mb: 2 }}>{message}</Typography>
                <Button variant="contained" onClick={onClose} sx={{ borderRadius: 2 }}>
                    OK
                </Button>
            </Box>
        </Box>
    );
};

export default Alert;
