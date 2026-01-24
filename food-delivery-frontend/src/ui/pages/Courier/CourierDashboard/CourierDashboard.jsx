import React, { useEffect, useState } from "react";
import {
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Box,
    Card,
    CardContent,
    Chip,
    Tooltip,
    Popover,
    List,
    ListItem,
    ListItemText,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import axiosInstance from "../../../../axios/axios.js";
import useAuth from "../../../../hooks/useAuth.js";
import Alert from "../../../../common/Alert.jsx";

const CourierDashboard = () => {
    const [confirmedOrders, setConfirmedOrders] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const [myDeliveredOrders, setMyDeliveredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);

    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    const handleItemsClick = (event, products) => {
        setAnchorEl(event.currentTarget);
        setSelectedProducts(products || []);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    const fetchOrders = async () => {
        try {
            const [confirmedRes, myOrdersRes, myDeliveredOrdersRes] = await Promise.all([
                axiosInstance.get("/orders/confirmed"),
                axiosInstance.get("/couriers/my-orders"),
                axiosInstance.get("/couriers/my-delivered-orders"),
            ]);
            setConfirmedOrders(confirmedRes.data);
            setMyOrders(myOrdersRes.data);
            setMyDeliveredOrders(myDeliveredOrdersRes.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleAssign = async (orderId) => {
        try {
            await axiosInstance.post(`/couriers/assign/${orderId}`);
            await fetchOrders();
            setAlertMessage("Order assigned successfully!");
            setAlertOpen(true);
        } catch (err) {
            setAlertMessage(
                "Failed to assign order: " + (err.response?.data?.message || err.message)
            );
            setAlertOpen(true);
        }
    };

    const handleComplete = async (orderId) => {
        try {
            await axiosInstance.post(`/couriers/complete/${orderId}`);
            await fetchOrders();
            setAlertMessage("Order completed successfully!");
            setAlertOpen(true);
        } catch (err) {
            setAlertMessage(
                "Failed to complete order: " + (err.response?.data?.message || err.message)
            );
            setAlertOpen(true);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "CONFIRMED": return "primary";
            case "PICKED_UP": return "warning";
            case "DELIVERED": return "success";
            default: return "default";
        }
    };

    if (loading) return <Typography>Loading...</Typography>;

    const TruncatedCell = ({ children, title }) => (
        <Tooltip title={title || ""}>
            <span style={{
                display: "inline-block",
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
            }}>
                {children}
            </span>
        </Tooltip>
    );

    return (
        <Box data-testid="courier-page">
            <Typography variant="h4" sx={{ mb: 3 }}>
                Courier Dashboard
            </Typography>

            <MuiAlert severity="info" sx={{ mb: 3 }}>
                Welcome, {user?.username}! You can assign yourself to confirmed orders and track your deliveries.
            </MuiAlert>

            {/* Available Orders */}
            <Card data-testid="courier-available-section" sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                        Available Orders for Pickup
                    </Typography>

                    <TableContainer data-testid="courier-available-table" component={Paper}>
                        <Table sx={{ tableLayout: "fixed" }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Order ID</TableCell>
                                    <TableCell>Customer</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Restaurant</TableCell>
                                    <TableCell>Items</TableCell>
                                    <TableCell>Address</TableCell>
                                    <TableCell>Total</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {confirmedOrders
                                    .filter(o => o.status === "CONFIRMED")
                                    .map(order => (
                                        <TableRow
                                            key={order.id}
                                            data-testid={`courier-available-row-${order.id}`}
                                        >
                                            <TableCell>#{order.id}</TableCell>
                                            <TableCell>
                                                <TruncatedCell title={order.userUsername}>
                                                    {order.userUsername}
                                                </TruncatedCell>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    data-testid={`courier-status-${order.id}`}
                                                    label={order.status}
                                                    color={getStatusColor(order.status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TruncatedCell title={order.restaurantName}>
                                                    {order.restaurantName}
                                                </TruncatedCell>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    data-testid={`courier-items-btn-${order.id}`}
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={(e) => handleItemsClick(e, order.products)}
                                                >
                                                    {order.products?.length || 0} items
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                <TruncatedCell title={order.deliveryAddress?.line1}>
                                                    {order.deliveryAddress?.line1}
                                                </TruncatedCell>
                                            </TableCell>
                                            <TableCell>
                                                {order.total?.toFixed(2) || "0.00"} ден.
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    data-testid={`courier-assign-${order.id}`}
                                                    variant="contained"
                                                    size="small"
                                                    onClick={() => handleAssign(order.id)}
                                                >
                                                    Start Delivery
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Active Deliveries */}
            <Card data-testid="courier-active-section" sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                        My Active Deliveries
                    </Typography>

                    <TableContainer data-testid="courier-active-table" component={Paper}>
                        <Table sx={{ tableLayout: "fixed" }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Order ID</TableCell>
                                    <TableCell>Customer</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Restaurant</TableCell>
                                    <TableCell>Items</TableCell>
                                    <TableCell>Address</TableCell>
                                    <TableCell>Total</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {myOrders
                                    .filter(o => o.status !== "DELIVERED")
                                    .map(order => (
                                        <TableRow
                                            key={order.id}
                                            data-testid={`courier-active-row-${order.id}`}
                                        >
                                            <TableCell>#{order.id}</TableCell>
                                            <TableCell>
                                                <TruncatedCell title={order.userUsername}>
                                                    {order.userUsername}
                                                </TruncatedCell>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    data-testid={`courier-status-${order.id}`}
                                                    label={order.status}
                                                    color={getStatusColor(order.status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TruncatedCell title={order.restaurantName}>
                                                    {order.restaurantName}
                                                </TruncatedCell>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    data-testid={`courier-items-btn-${order.id}`}
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={(e) => handleItemsClick(e, order.products)}
                                                >
                                                    {order.products?.length || 0} items
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                <TruncatedCell title={order.deliveryAddress?.line1}>
                                                    {order.deliveryAddress?.line1}
                                                </TruncatedCell>
                                            </TableCell>
                                            <TableCell>
                                                {order.total?.toFixed(2) || "0.00"} ден.
                                            </TableCell>
                                            <TableCell>
                                                {order.status === "PICKED_UP" && (
                                                    <Button
                                                        data-testid={`courier-complete-${order.id}`}
                                                        variant="contained"
                                                        color="success"
                                                        size="small"
                                                        onClick={() => handleComplete(order.id)}
                                                    >
                                                        Mark Delivered
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Delivered Orders */}
            <Card data-testid="courier-delivered-section">
                <CardContent>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                        My Delivered Orders
                    </Typography>

                    <TableContainer data-testid="courier-delivered-table" component={Paper}>
                        <Table sx={{ tableLayout: "fixed" }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Order ID</TableCell>
                                    <TableCell>Customer</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Restaurant</TableCell>
                                    <TableCell>Items</TableCell>
                                    <TableCell>Address</TableCell>
                                    <TableCell>Total</TableCell>
                                    <TableCell>Delivered At</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {myDeliveredOrders.map(order => (
                                    <TableRow
                                        key={order.id}
                                        data-testid={`courier-delivered-row-${order.id}`}
                                    >
                                        <TableCell>#{order.id}</TableCell>
                                        <TableCell>
                                            <TruncatedCell title={order.userUsername}>
                                                {order.userUsername}
                                            </TruncatedCell>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                data-testid={`courier-status-${order.id}`}
                                                label={order.status}
                                                color={getStatusColor(order.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TruncatedCell title={order.restaurantName}>
                                                {order.restaurantName}
                                            </TruncatedCell>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                data-testid={`courier-items-btn-${order.id}`}
                                                variant="outlined"
                                                size="small"
                                                onClick={(e) => handleItemsClick(e, order.products)}
                                            >
                                                {order.products?.length || 0} items
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <TruncatedCell title={order.deliveryAddress?.line1}>
                                                {order.deliveryAddress?.line1}
                                            </TruncatedCell>
                                        </TableCell>
                                        <TableCell>
                                            {order.total?.toFixed(2) || "0.00"} ден.
                                        </TableCell>
                                        <TableCell>
                                            {order.deliveredAt
                                                ? new Date(order.deliveredAt).toLocaleString()
                                                : "-"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Items Popover */}
            <Popover
                data-testid="courier-items-popover"
                open={open}
                anchorEl={anchorEl}
                onClose={handlePopoverClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
            >
                <Box sx={{ p: 2, maxWidth: 250 }}>
                    {selectedProducts.length > 0 ? (
                        <List dense>
                            {selectedProducts.map((p, i) => (
                                <ListItem
                                    key={i}
                                    data-testid={`courier-item-${i}`}
                                    disablePadding
                                >
                                    <ListItemText primary={p.name} />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography color="text.secondary">No products</Typography>
                    )}
                </Box>
            </Popover>

            <Alert
                data-testid="courier-alert"
                open={alertOpen}
                onClose={() => setAlertOpen(false)}
                message={alertMessage}
            />
        </Box>
    );
};

export default CourierDashboard;
