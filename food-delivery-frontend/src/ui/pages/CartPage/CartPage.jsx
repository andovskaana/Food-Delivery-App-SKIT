import React, { useState } from "react";
import useOrder from "../../../hooks/useOrder.js";
import OrderList from "../../components/order/OrderList/OrderList.jsx";
import orderRepository from "../../../repository/orderRepository.js";
import { useNavigate } from "react-router";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    Divider,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Alert from "../../../common/Alert.jsx";

function ConfirmPopup({ open, message, onCancel, onConfirm }) {
    if (!open) return null;
    return (
        <Box
            data-testid="cart-confirm-overlay"
            sx={{
                position: "fixed",
                inset: 0,
                bgcolor: "rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2000,
                p: 2,
            }}
        >
            <Box
                data-testid="cart-confirm-dialog"
                sx={{
                    bgcolor: "white",
                    borderRadius: 3,
                    p: 3,
                    width: "90%",
                    maxWidth: 420,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    textAlign: "center",
                }}
            >
                <Typography data-testid="cart-confirm-message" sx={{ mb: 2 }}>
                    {message}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                    <Button
                        data-testid="cart-confirm-cancel-btn"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        data-testid="cart-confirm-ok-btn"
                        variant="contained"
                        color="error"
                        onClick={onConfirm}
                    >
                        Confirm
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}

const CartPage = () => {
    const { order, loading, refresh } = useOrder();
    const navigate = useNavigate();

    const [showAddressDialog, setShowAddressDialog] = useState(false);
    const [address, setAddress] = useState({
        line1: "",
        line2: "",
        city: "",
        postalCode: "",
        country: "",
    });

    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [confirmOpen, setConfirmOpen] = useState(false);

    const onCheckout = () => {
        if (!order?.deliveryAddress) {
            setShowAddressDialog(true);
            return;
        }
        navigate("/checkout");
    };

    const onCancel = () => {
        setConfirmOpen(true);
    };

    const handleSaveAddress = async () => {
        if (!address.line1 || !address.city || !address.country) {
            setAlertMessage("Please fill in Line 1, City, and Country.");
            setAlertOpen(true);
            return;
        }
        await orderRepository.updateAddress(order.id, address);
        await refresh();
        setShowAddressDialog(false);
        navigate("/checkout");
    };

    if (loading) return <>Loading...</>;

    return (
        <Box
            data-testid="cart-page"
            sx={{ maxWidth: 1000, mx: "auto", mt: 4, px: 2 }}
        >
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 1 }}>
                <ShoppingCartIcon color="primary" />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Your Cart
                </Typography>
            </Box>

            {/* Order list */}
            <Box data-testid="cart-order-list">
                <OrderList
                    order={order}
                    onCheckout={onCheckout}
                    onCancel={onCancel}
                    refresh={refresh}
                />
            </Box>

            {/* Address Dialog */}
            <Dialog
                data-testid="cart-address-dialog"
                open={showAddressDialog}
                onClose={() => setShowAddressDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 700 }}>
                    Enter Delivery Address
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ mt: 1 }}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        Please provide your delivery details so we can bring your order right to your door.
                    </Typography>

                    <TextField
                        data-testid="cart-address-line1"
                        fullWidth
                        margin="normal"
                        label="Address Line 1"
                        value={address.line1}
                        onChange={(e) =>
                            setAddress({ ...address, line1: e.target.value })
                        }
                    />
                    <TextField
                        data-testid="cart-address-line2"
                        fullWidth
                        margin="normal"
                        label="Address Line 2"
                        value={address.line2}
                        onChange={(e) =>
                            setAddress({ ...address, line2: e.target.value })
                        }
                    />
                    <TextField
                        data-testid="cart-address-city"
                        fullWidth
                        margin="normal"
                        label="City"
                        value={address.city}
                        onChange={(e) =>
                            setAddress({ ...address, city: e.target.value })
                        }
                    />
                    <TextField
                        data-testid="cart-address-postal"
                        fullWidth
                        margin="normal"
                        label="Postal Code"
                        value={address.postalCode}
                        onChange={(e) =>
                            setAddress({ ...address, postalCode: e.target.value })
                        }
                    />
                    <TextField
                        data-testid="cart-address-country"
                        fullWidth
                        margin="normal"
                        label="Country"
                        value={address.country}
                        onChange={(e) =>
                            setAddress({ ...address, country: e.target.value })
                        }
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        data-testid="cart-address-cancel-btn"
                        onClick={() => setShowAddressDialog(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        data-testid="cart-address-save-btn"
                        variant="contained"
                        onClick={handleSaveAddress}
                        sx={{ borderRadius: 2 }}
                    >
                        Save & Continue
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirm clear cart */}
            <ConfirmPopup
                open={confirmOpen}
                message="Remove all items from the cart?"
                onCancel={() => setConfirmOpen(false)}
                onConfirm={async () => {
                    await orderRepository.cancelPending();
                    await refresh();
                    setConfirmOpen(false);
                    setAlertMessage("Cart cleared.");
                    setAlertOpen(true);
                }}
            />

            {/* Alert */}
            <Alert
                open={alertOpen}
                onClose={() => setAlertOpen(false)}
                message={alertMessage}
                data-testid="cart-alert"
            />
        </Box>
    );
};

export default CartPage;
