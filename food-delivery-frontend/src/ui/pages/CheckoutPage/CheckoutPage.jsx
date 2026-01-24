import React, { useEffect, useState, useMemo } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Divider,
    Grid,
    Stack,
    Typography,
    Alert as MuiInfoAlert,
    Tooltip,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import useOrder from "../../../hooks/useOrder.js";
import paymentRepository from "../../../repository/paymentRepository.js";
import orderRepository from "../../../repository/orderRepository.js";
import { useNavigate } from "react-router";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Alert from "../../../common/Alert.jsx";

/* ---------- Page ---------- */
const CheckoutPage = () => {
    const { order, loading } = useOrder();
    const [payment, setPayment] = useState(null);
    const [busy, setBusy] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        if (!order?.id) return;
        paymentRepository.createIntent(order.id).then((res) => setPayment(res.data));
    }, [order?.id]);

    const summary = useMemo(() => {
        const items = order?.items ?? [];
        const subtotal =
            order?.subtotal ??
            items.reduce((acc, it) => acc + (it.price ?? 0) * (it.quantity ?? 1), 0);
        const delivery = order?.deliveryFee ?? 0;
        const tax = order?.tax ?? 0;
        const total = order?.total ?? subtotal + delivery + tax;
        return { items, subtotal, delivery, tax, total, currency: order?.currency ?? "€" };
    }, [order]);

    const simulateSuccess = async () => {
        if (!payment?.id) return;
        setBusy(true);
        await paymentRepository.simulateSuccess(payment.id);
        await orderRepository.confirmPending();
        setBusy(false);
        setAlertMessage("Payment succeeded! Order confirmed.");
        setAlertOpen(true);
        navigate("/");
    };

    const simulateFailure = async () => {
        if (!payment?.id) return;
        setBusy(true);
        await paymentRepository.simulateFailure(payment.id);
        setBusy(false);
        setAlertMessage("Payment failed (simulated). Try again.");
        setAlertOpen(true);
    };

    if (loading) return <Typography>Loading…</Typography>;
    if (!order) return <Typography>No pending order to pay.</Typography>;

    const PUBLISHABLE_KEY =
        "pk_test_51S0LPxISIz2c7ED1kvux04tVOZWothXvPPC664G8ob5m0bfUO8dl8Jv4JzbIIMAQRJ1FPJ8aae3cr1IZPdFBJkH200XCUEHZcd";
    const stripePromise = loadStripe(PUBLISHABLE_KEY);

    const hasClientSecret = !!payment?.clientSecret;
    const usingRealStripe = !!stripePromise && hasClientSecret;

    return (
        <Box
            data-testid="checkout-page"
            sx={{ maxWidth: 1100, mx: "auto" }}
        >
            {/* Page title */}
            <Stack
                data-testid="checkout-header"
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 2 }}
            >
                <ReceiptLongIcon color="primary" />
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Checkout
                </Typography>
                <Chip
                    data-testid="checkout-mode-chip"
                    size="small"
                    label={usingRealStripe ? "Test Mode (Stripe)" : "Demo Mode"}
                    color={usingRealStripe ? "primary" : "default"}
                    sx={{ ml: 1 }}
                />
            </Stack>

            <Grid container spacing={3}>
                {/* LEFT: Payment */}
                <Grid item xs={12} md={7}>
                    <Card
                        data-testid="checkout-payment-card"
                        sx={{
                            borderRadius: 3,
                            boxShadow: "0 4px 18px rgba(16,24,40,.06)",
                            overflow: "hidden",
                        }}
                    >
                        <CardHeader
                            title={
                                <Stack direction="row" alignItems="center" spacing={1.25}>
                                    <CreditCardIcon color="primary" />
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                        Payment
                                    </Typography>
                                </Stack>
                            }
                            sx={{ pb: 1.5 }}
                        />
                        <CardContent>
                            {usingRealStripe ? (
                                <Elements stripe={stripePromise} options={{ clientSecret: payment.clientSecret }}>
                                    <StripeForm
                                        clientSecret={payment.clientSecret}
                                        busy={busy}
                                        setBusy={setBusy}
                                        onPaid={async () => {
                                            await orderRepository.confirmPending();
                                            setAlertMessage("Payment succeeded! Order confirmed.");
                                            setAlertOpen(true);
                                            navigate("/");
                                        }}
                                        setAlertMessage={setAlertMessage}
                                        setAlertOpen={setAlertOpen}
                                    />
                                </Elements>
                            ) : (
                                <>
                                    <MuiInfoAlert
                                        severity="info"
                                        icon={<InfoOutlinedIcon fontSize="small" />}
                                        sx={{ mb: 2 }}
                                    >
                                        Demo mode enabled. Use the buttons below to simulate outcomes.
                                    </MuiInfoAlert>
                                    <Stack direction="row" spacing={1}>
                                        <Button
                                            data-testid="checkout-simulate-success"
                                            disabled={!payment || busy}
                                            variant="contained"
                                            onClick={simulateSuccess}
                                        >
                                            Simulate success
                                        </Button>
                                        <Button
                                            data-testid="checkout-simulate-failure"
                                            disabled={!payment || busy}
                                            onClick={simulateFailure}
                                        >
                                            Simulate failure
                                        </Button>
                                    </Stack>
                                </>
                            )}

                            {payment && (
                                <Typography
                                    data-testid="checkout-payment-info"
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ display: "block", mt: 2 }}
                                >
                                    Payment ID: {payment.id} · Provider: {payment.provider} · Status: {payment.status}
                                </Typography>
                            )}

                            <Divider sx={{ my: 2 }} />

                            <Stack direction="row" alignItems="center" spacing={1} sx={{ color: "text.secondary" }}>
                                <LockOutlinedIcon fontSize="small" />
                                <Typography variant="caption">
                                    Payments are secured by Stripe. Test card{" "}
                                    <Tooltip title="4242 4242 4242 4242 · any future date · any CVC">
                                        <strong>4242&nbsp;4242&nbsp;4242&nbsp;4242</strong>
                                    </Tooltip>
                                </Typography>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* RIGHT: Summary */}
                <Grid item xs={12} md={5}>
                    <Card
                        data-testid="checkout-summary-card"
                        sx={{
                            borderRadius: 3,
                            boxShadow: "0 4px 18px rgba(16,24,40,.06)",
                            overflow: "hidden",
                        }}
                    >
                        <CardHeader
                            title={
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                    Order Summary
                                </Typography>
                            }
                            sx={{ pb: 1.5 }}
                        />
                        <CardContent>
                            <Stack spacing={1.25}>
                                {(summary.items.length
                                        ? summary.items
                                        : [{ name: "Your items", quantity: 1, unitPriceSnapshot: summary.subtotal }]
                                ).map((it, idx) => (
                                    <Stack
                                        key={idx}
                                        direction="row"
                                        justifyContent="space-between"
                                        data-testid={`checkout-summary-item-${idx}`}
                                    >
                                        <Typography variant="body2">
                                            {it.quantity ? `${it.quantity} × ` : ""}
                                            {it.name}
                                        </Typography>
                                        <Typography variant="body2">
                                            {summary.currency}
                                            {(it.unitPriceSnapshot * (it.quantity ?? 1)).toFixed(2)}
                                        </Typography>
                                    </Stack>
                                ))}

                                <Divider sx={{ my: 0.75 }} />

                                <Row label="Subtotal" value={summary.subtotal} currency={summary.currency} testId="subtotal" />
                                <Row label="Delivery" value={summary.delivery} currency={summary.currency} testId="delivery" />
                                <Row label="Tax" value={summary.tax} currency={summary.currency} testId="tax" />

                                <Divider sx={{ my: 0.75 }} />

                                <Row label="Total" value={summary.total} currency={summary.currency} strong testId="total" />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Alert
                data-testid="checkout-alert"
                open={alertOpen}
                onClose={() => setAlertOpen(false)}
                message={alertMessage}
            />
        </Box>
    );
};

export default CheckoutPage;

/* ---------- helpers ---------- */
function Row({ label, value = 0, currency = "€", strong = false, testId }) {
    return (
        <Stack
            data-testid={`checkout-summary-${testId}`}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
        >
            <Typography variant={strong ? "subtitle2" : "body2"} sx={{ fontWeight: strong ? 700 : 400 }}>
                {label}
            </Typography>
            <Typography variant={strong ? "subtitle2" : "body2"} sx={{ fontWeight: strong ? 800 : 500 }}>
                {currency}
                {Number(value).toFixed(2)}
            </Typography>
        </Stack>
    );
}

/* ---------- Stripe Card Form ---------- */
function StripeForm({ clientSecret, busy, setBusy, onPaid, setAlertMessage, setAlertOpen }) {
    const stripe = useStripe();
    const elements = useElements();

    const handlePay = async () => {
        if (!stripe || !elements) return;
        setBusy(true);

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: { card: elements.getElement(CardElement) },
        });

        setBusy(false);

        if (error) {
            setAlertMessage(error.message || "Payment failed");
            setAlertOpen(true);
            return;
        }
        if (paymentIntent && paymentIntent.status === "succeeded") {
            await onPaid();
        } else {
            setAlertMessage(`Payment status: ${paymentIntent?.status ?? "unknown"}`);
            setAlertOpen(true);
        }
    };

    return (
        <Stack spacing={1.5}>
            <Box
                data-testid="checkout-stripe-card"
                sx={{
                    p: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    background: "linear-gradient(180deg, rgba(249,250,251,.65), rgba(249,250,251,.35))",
                }}
            >
                <CardElement
                    options={{
                        hidePostalCode: true,
                        style: {
                            base: {
                                fontSize: "16px",
                                "::placeholder": { color: "#9CA3AF" },
                            },
                            invalid: { color: "#ef4444" },
                        },
                    }}
                />
            </Box>

            <Button
                data-testid="checkout-pay-btn"
                variant="contained"
                size="large"
                onClick={handlePay}
                disabled={busy || !stripe}
                sx={{ borderRadius: 2, fontWeight: 700 }}
            >
                Pay Securely
            </Button>
        </Stack>
    );
}
