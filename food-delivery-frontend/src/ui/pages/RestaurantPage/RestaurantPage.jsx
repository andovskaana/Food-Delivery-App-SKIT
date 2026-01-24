import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router";
import {
    Typography,
    Card,
    CardContent,
    Box,
    Divider,
    Chip,
    CardMedia,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StarIcon from "@mui/icons-material/Star";
import restaurantRepository from "../../../repository/restaurantRepository.js";
import productRepository from "../../../repository/productRepository.js";
import { addToCartRespectingSingleRestaurant } from "../../../repository/cartActions.js";
import reviewRepository from "../../../repository/reviewRepository.js";
import ReviewForm from "../../components/reviews/ReviewForm/ReviewForm.jsx";
import useAuth from "../../../hooks/useAuth.js";
import Alert from "../../../common/Alert.jsx";

/* helpers */
const mkd = (n) => `${Number(n || 0).toFixed(0)} ден`;

const timeToMinutes = (hhmm) => {
    const [h, m] = (hhmm || "").split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
};

const parseIntervals = (value) => {
    if (!value || typeof value !== "string") return [];
    return value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((part) => {
            const [start, end] = part.split("-").map((s) => s.trim());
            if (!start || !end) return null;
            return { start: timeToMinutes(start), end: timeToMinutes(end) };
        })
        .filter(Boolean);
};

const isOpenAt = (nowMin, intervals) => {
    for (const { start, end } of intervals) {
        if (start === end) continue;
        if (start < end) {
            if (nowMin >= start && nowMin < end) return true;
        } else {
            if (nowMin >= start || nowMin < end) return true;
        }
    }
    return false;
};

/* Product row */
const KorpaRowCard = ({ product, onAdd }) => {
    const { user } = useAuth();

    const basePrice = Number(product.price || 0);
    const oldPrice = product.oldPrice ? Number(product.oldPrice) : null;
    const discountPct = product.discountPercent ?? product.discount ?? null;

    const computedDiscounted =
        discountPct != null ? basePrice * (1 - Number(discountPct) / 100) : null;

    const hasDiscount = Boolean(oldPrice) || discountPct != null;
    const newPrice = hasDiscount
        ? Number(product.discountedPrice ?? computedDiscounted ?? basePrice)
        : basePrice;

    return (
        <Card
            data-testid={`restaurant-product-${product.id}`}
            variant="outlined"
            sx={{
                mb: 2,
                borderRadius: 2,
                overflow: "hidden",
                minHeight: 128,
                display: "flex",
            }}
        >
            <Box sx={{ width: 160, borderRight: "1px solid", borderColor: "divider" }}>
                <CardMedia
                    component="img"
                    alt={product.name}
                    image={
                        product.imageUrl ||
                        "https://via.placeholder.com/300x200?text=Food"
                    }
                    sx={{ width: 140, height: 100, objectFit: "cover", m: 1 }}
                />
            </Box>

            <CardContent sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {product.description}
                </Typography>

                <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                    {hasDiscount && (
                        <Chip size="small" label="АКЦИЈА" color="warning" />
                    )}
                    {!!product.category && (
                        <Chip size="small" label={product.category} />
                    )}
                </Box>
            </CardContent>

            <Box
                sx={{
                    width: 220,
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    gap: 1,
                    borderLeft: "1px solid",
                    borderColor: "divider",
                }}
            >
                <Typography variant="h6" sx={{ color: "success.main", fontWeight: 700 }}>
                    {mkd(newPrice)}
                </Typography>

                {user?.roles?.includes("CUSTOMER") && (
                    <Button
                        data-testid={`restaurant-add-btn-${product.id}`}
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => onAdd(product.id)}
                        disabled={!product.isAvailable || product.quantity <= 0}
                        sx={{ borderRadius: 999 }}
                    >
                        {product.quantity <= 0 ? "Нема залиха" : "Додади"}
                    </Button>
                )}
            </Box>
        </Card>
    );
};

const RestaurantPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [restaurant, setRestaurant] = useState(null);
    const [products, setProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOpenNow, setIsOpenNow] = useState(false);
    const [closedDialogOpen, setClosedDialogOpen] = useState(false);

    const categoryRefs = useRef({});
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    useEffect(() => {
        Promise.all([
            restaurantRepository.findById(id),
            productRepository.findAll(),
            reviewRepository.list(id),
        ])
            .then(([r, p, rv]) => {
                setRestaurant(r.data);
                setProducts(p.data.filter((x) => String(x.restaurantId) === String(id)));
                setReviews(rv.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const intervals = useMemo(() => {
        const raw = restaurant?.openHours || "09:00-22:00";
        return parseIntervals(raw);
    }, [restaurant?.openHours]);

    useEffect(() => {
        const tick = () => {
            const now = new Date();
            const nowMin = now.getHours() * 60 + now.getMinutes();
            setIsOpenNow(isOpenAt(nowMin, intervals));
        };
        tick();
        const t = setInterval(tick, 60000);
        return () => clearInterval(t);
    }, [intervals]);

    const handleAdd = async (productId) => {
        if (!isOpenNow) {
            setClosedDialogOpen(true);
            return;
        }
        try {
            const res = await addToCartRespectingSingleRestaurant(productId);
            if (res?.ok) {
                setAlertMessage(res.replaced ? "Cart replaced and item added." : "Added to cart.");
                setAlertOpen(true);
            }
        } catch {
            setAlertMessage("Failed to add item to cart.");
            setAlertOpen(true);
        }
    };

    const handleReview = async ({ rating, comment }) => {
        try {
            await reviewRepository.add(id, { rating, comment });
            const rv = await reviewRepository.list(id);
            setReviews(rv.data);
            setAlertMessage("Review submitted successfully!");
            setAlertOpen(true);
        } catch {
            setAlertMessage("Failed to submit review.");
            setAlertOpen(true);
        }
    };

    if (loading) return <Typography>Loading...</Typography>;
    if (!restaurant) return <Typography>Restaurant not found.</Typography>;

    const grouped = products.reduce((acc, p) => {
        const cat = p.category?.trim() || "Other";
        (acc[cat] ||= []).push(p);
        return acc;
    }, {});

    const categories = Object.keys(grouped);

    return (
        <Box data-testid="restaurant-page">
            {/* Header */}
            <Card data-testid="restaurant-header" sx={{ mb: 3 }}>
                <CardMedia
                    component="img"
                    height="300"
                    image={restaurant.imageUrl}
                    alt={restaurant.name}
                />
                <CardContent>
                    <Typography variant="h3">{restaurant.name}</Typography>

                    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                        <Chip
                            data-testid="restaurant-status"
                            label={isOpenNow ? "Open" : "Closed"}
                            color={isOpenNow ? "success" : "error"}
                        />
                        <Chip
                            icon={<AccessTimeIcon />}
                            label={`${restaurant.deliveryTimeEstimate || 30} min`}
                        />
                    </Box>

                    <Typography>{restaurant.description}</Typography>
                </CardContent>
            </Card>

            {/* Categories */}
            <Box sx={{ display: "flex", gap: 1, mb: 2, overflowX: "auto" }}>
                {categories.map((cat) => (
                    <Chip
                        key={cat}
                        data-testid={`restaurant-category-${cat}`}
                        label={cat}
                        clickable
                        onClick={() =>
                            categoryRefs.current[cat]?.scrollIntoView({ behavior: "smooth" })
                        }
                    />
                ))}
            </Box>

            {/* Menu */}
            <Typography variant="h4" sx={{ mb: 2 }}>
                Мени
            </Typography>

            {categories.map((cat) => (
                <Box
                    key={cat}
                    data-testid={`restaurant-menu-section-${cat}`}
                    ref={(el) => (categoryRefs.current[cat] = el)}
                    sx={{ mb: 4 }}
                >
                    <Typography variant="h5" sx={{ mb: 2 }}>
                        {cat}
                    </Typography>
                    {grouped[cat].map((p) => (
                        <KorpaRowCard key={p.id} product={p} onAdd={handleAdd} />
                    ))}
                </Box>
            ))}

            <Divider sx={{ my: 4 }} />

            {/* Reviews */}
            <Box data-testid="restaurant-reviews">
                <Typography variant="h4" sx={{ mb: 2 }}>
                    Reviews
                </Typography>

                {user?.roles?.includes("CUSTOMER") && (
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <ReviewForm
                                data-testid="restaurant-review-form"
                                onSubmit={handleReview}
                            />
                        </CardContent>
                    </Card>
                )}
            </Box>

            {/* Closed dialog */}
            <Dialog
                data-testid="restaurant-closed-dialog"
                open={closedDialogOpen}
                onClose={() => setClosedDialogOpen(false)}
            >
                <DialogTitle>Cannot order</DialogTitle>
                <DialogContent>
                    The restaurant is currently closed.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setClosedDialogOpen(false)}>OK</Button>
                </DialogActions>
            </Dialog>

            <Alert
                data-testid="restaurant-alert"
                open={alertOpen}
                onClose={() => setAlertOpen(false)}
                message={alertMessage}
            />
        </Box>
    );
};

export default RestaurantPage;
