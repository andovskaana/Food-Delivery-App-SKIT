import React, { useEffect, useState } from "react";
import orderRepository from "../../../repository/orderRepository.js";
import { useNavigate } from "react-router";
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardActions,
    Button,
    Grid,
    Divider,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

const MyOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        orderRepository.getMyOrders().then((res) => {
            setOrders(res.data);
        });
    }, []);

    return (
        <Box
            data-testid="orders-page"
            sx={{ maxWidth: 1200, mx: "auto", px: 2, py: 4 }}
        >
            {/* Header */}
            <Box
                data-testid="orders-header"
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
            >
                <ReceiptLongIcon color="primary" />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    My Orders
                </Typography>
            </Box>

            {/* Empty state */}
            {orders.length === 0 ? (
                <Typography
                    data-testid="orders-empty"
                    color="text.secondary"
                    sx={{ mt: 2 }}
                >
                    You don’t have any confirmed orders yet.
                </Typography>
            ) : (
                <Grid
                    data-testid="orders-grid"
                    container
                    spacing={3}
                >
                    {orders.map((order) => (
                        <Grid item xs={12} sm={6} md={4} key={order.id}>
                            <Card
                                data-testid={`order-card-${order.id}`}
                                variant="outlined"
                                sx={{
                                    height: "100%",
                                    borderRadius: 2,
                                    boxShadow:
                                        "0 2px 6px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.08)",
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography
                                        variant="h6"
                                        sx={{ fontWeight: 600, mb: 1 }}
                                    >
                                        Order #{order.id}
                                    </Typography>

                                    <Divider sx={{ mb: 1.5 }} />

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Restaurant:{" "}
                                        <strong>{order.restaurantName}</strong>
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Total:{" "}
                                        <strong>
                                            {order.total.toFixed(2)} ден.
                                        </strong>
                                    </Typography>

                                    <Typography
                                        data-testid={`order-status-${order.id}`}
                                        variant="body2"
                                        sx={{
                                            mt: 1,
                                            fontWeight: 600,
                                            color:
                                                order.status === "Delivered"
                                                    ? "success.main"
                                                    : order.status === "Pending"
                                                        ? "warning.main"
                                                        : "primary.main",
                                        }}
                                    >
                                        Status: {order.status}
                                    </Typography>
                                </CardContent>

                                <CardActions sx={{ p: 2, pt: 0 }}>
                                    <Button
                                        data-testid={`order-track-${order.id}`}
                                        fullWidth
                                        size="small"
                                        variant="contained"
                                        onClick={() =>
                                            navigate(`/orders/track/${order.id}`)
                                        }
                                        sx={{
                                            borderRadius: 2,
                                            textTransform: "none",
                                        }}
                                    >
                                        Track Order
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default MyOrdersPage;
