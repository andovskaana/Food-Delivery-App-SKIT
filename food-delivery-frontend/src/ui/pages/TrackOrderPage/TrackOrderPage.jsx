import React, { useEffect, useState } from 'react';
import { useParams } from "react-router";
import {
    Typography,
    Card,
    CardContent,
    Box,
    Stepper,
    Step,
    StepLabel,
    Chip,
    Divider,
    LinearProgress
} from "@mui/material";
import axiosInstance from "../../../axios/axios.js";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';

const TrackOrderPage = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        'Order Confirmed',
        'Restaurant Accepted',
        'Preparing Food',
        'Ready for Pickup',
        'Out for Delivery',
        'Delivered'
    ];

    const fetchOrder = async () => {
        try {
            const response = await axiosInstance.get(`/orders/track/${orderId}`);
            setOrder(response.data);

            switch (response.data.status) {
                case 'PICKED_UP':
                    setCurrentStep(4);
                    localStorage.setItem(`orderStep-${orderId}`, 4);
                    break;
                case 'DELIVERED':
                    setCurrentStep(5);
                    localStorage.setItem(`orderStep-${orderId}`, 5);
                    break;
                default:
                    break;
            }

        } catch (err) {
            console.error('Error fetching order:', err);
        } finally {
            setLoading(false);
        }
    };

    // Restore step from localStorage
    useEffect(() => {
        const storedStep = parseInt(localStorage.getItem(`orderStep-${orderId}`), 10);
        if (!isNaN(storedStep)) {
            setCurrentStep(storedStep);
        }
    }, [orderId]);

    // Poll backend
    useEffect(() => {
        fetchOrder();
        const interval = setInterval(fetchOrder, 30000);
        return () => clearInterval(interval);
    }, [orderId]);

    // Fake progress until pickup
    useEffect(() => {
        if (!order) return;
        if (order.status === 'PICKED_UP' || order.status === 'DELIVERED') return;

        const progressInterval = setInterval(() => {
            setCurrentStep(prev => {
                if (prev < 3) {
                    const next = prev + 1;
                    localStorage.setItem(`orderStep-${orderId}`, next);
                    return next;
                }
                return prev;
            });
        }, 10000);

        return () => clearInterval(progressInterval);
    }, [order, orderId]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'CONFIRMED': return 'info';
            case 'PICKED_UP':
            case 'EN_ROUTE': return 'warning';
            case 'DELIVERED': return 'success';
            default: return 'default';
        }
    };

    if (loading) {
        return (
            <Box data-testid="track-order-loading">
                <LinearProgress />
            </Box>
        );
    }

    if (!order) {
        return <Typography>Order not found.</Typography>;
    }

    return (
        <Box data-testid="track-order-page">
            {/* Title */}
            <Typography
                data-testid="track-order-title"
                variant="h4"
                sx={{
                    fontWeight: 800,
                    lineHeight: 1.15,
                    fontSize: { xs: "1.75rem", md: "2.25rem" },
                    mb: 3,
                }}
            >
                Track Order #{order.id}
            </Typography>

            {/* Status */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 3
                        }}
                    >
                        <Typography variant="h6">Order Status</Typography>
                        <Chip
                            data-testid="track-order-status"
                            label={order.status.replace(/_/g, ' ')}
                            color={getStatusColor(order.status)}
                            icon={
                                order.status === 'DELIVERED'
                                    ? <CheckCircleIcon />
                                    : <LocalShippingIcon />
                            }
                        />
                    </Box>

                    <Stepper
                        data-testid="track-order-stepper"
                        activeStep={currentStep}
                        alternativeLabel
                    >
                        {steps.map((label, index) => (
                            <Step
                                key={label}
                                completed={index < currentStep}
                                data-testid={`track-order-step-${index}`}
                            >
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </CardContent>
            </Card>

            {/* Courier */}
            {order.courier && (
                <Card
                    data-testid="track-order-courier"
                    sx={{ mb: 3 }}
                >
                    <CardContent>
                        <Typography
                            variant="h6"
                            sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                            <PersonIcon /> Your Courier
                        </Typography>
                        <Typography>
                            <strong>Name:</strong> {order.courier.name}
                        </Typography>
                        <Typography>
                            <strong>Phone:</strong> {order.courier.phone}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                        >
                            Your courier is {order.courier.active ? 'available' : 'currently delivering your order'}
                        </Typography>
                    </CardContent>
                </Card>
            )}

            {/* Order Details */}
            <Card data-testid="track-order-details">
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Order Details
                    </Typography>

                    <Typography variant="subtitle2" color="text.secondary">
                        Order placed: {order.placedAt
                        ? new Date(order.placedAt).toLocaleString()
                        : 'N/A'}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6">Restaurant:</Typography>
                    <Typography sx={{ mb: 2 }}>{order.restaurantName}</Typography>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6">Items:</Typography>
                    <Box data-testid="track-order-items">
                        {order.products?.map((item, index) => (
                            <Box
                                key={index}
                                sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
                            >
                                <Typography>{item.name}</Typography>
                                <Typography>{item.price?.toFixed(2)} ден.</Typography>
                            </Box>
                        ))}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Typography>Platform fee</Typography>
                        <Typography>{order.platformFee} ден.</Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box
                        data-testid="track-order-total"
                        sx={{ display: 'flex', justifyContent: 'space-between' }}
                    >
                        <Typography variant="h6">Total:</Typography>
                        <Typography variant="h6">
                            {order.total?.toFixed(2) || '0.00'} ден.
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default TrackOrderPage;
