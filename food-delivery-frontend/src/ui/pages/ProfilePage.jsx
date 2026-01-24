import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    CircularProgress
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router";

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        axios
            .get("http://localhost:8080/api/user/me", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => setUser(res.data))
            .catch((err) => console.error(err));
    }, []);

    if (!user) {
        return (
            <Box
                data-testid="profile-loading"
                sx={{ display: "flex", justifyContent: "center", mt: 6 }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            data-testid="profile-page"
            sx={{ maxWidth: 600, mx: "auto", mt: 6, px: 2 }}
        >
            <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ textAlign: "center", py: 5 }}>
                    <Typography
                        data-testid="profile-greeting"
                        variant="h5"
                        sx={{ fontWeight: 700, mb: 1 }}
                    >
                        Hello {user.name} {user.surname}! 👋
                    </Typography>

                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                        Welcome back to <strong>Ana2AnaFoodDelivery</strong>.
                    </Typography>

                    <Box
                        data-testid="profile-info"
                        sx={{ textAlign: "left", mb: 3 }}
                    >
                        <Typography>
                            <strong>Username:</strong> {user.username}
                        </Typography>
                        <Typography>
                            <strong>Email:</strong> {user.email}
                        </Typography>
                    </Box>

                    <Button
                        data-testid="profile-home-btn"
                        variant="contained"
                        size="large"
                        onClick={() => navigate("/")}
                    >
                        Start Browsing
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ProfilePage;
