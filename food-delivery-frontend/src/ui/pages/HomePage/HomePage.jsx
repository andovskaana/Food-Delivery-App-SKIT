import React, { useEffect, useMemo, useState } from "react";
import {
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Box,
    Chip,
    TextField,
} from "@mui/material";
import { Link } from "react-router";
import restaurantRepository from "../../../repository/restaurantRepository.js";
import banner from "../../../assets/banner.png";

/* ---------- opening-hours helpers ---------- */
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

/* ---------- Restaurant card ---------- */
const RestaurantCard = ({ restaurant }) => {
    const [isOpenNow, setIsOpenNow] = useState(false);
    const intervals = useMemo(() => {
        const raw = restaurant?.openHours || "09:00-22:00";
        return parseIntervals(raw);
    }, [restaurant?.openHours]);

    useEffect(() => {
        const compute = () => {
            const now = new Date();
            const nowMin = now.getHours() * 60 + now.getMinutes();
            setIsOpenNow(isOpenAt(nowMin, intervals));
        };
        compute();
        const id = setInterval(compute, 60 * 1000);
        return () => clearInterval(id);
    }, [intervals]);

    return (
        <Card
            data-testid={`restaurant-card-${restaurant.id}`}
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: "0 2px 10px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
                transition: "transform .15s ease, box-shadow .15s ease",
                "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.12), 0 3px 6px rgba(0,0,0,0.06)",
                },
            }}
        >
            <Box sx={{ position: "relative", aspectRatio: "4 / 3" }}>
                <Box
                    component="img"
                    alt={restaurant.name}
                    src={
                        restaurant.imageUrl ||
                        "https://via.placeholder.com/800x450?text=Restaurant"
                    }
                    sx={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                    }}
                />
            </Box>

            <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                    data-testid={`restaurant-name-${restaurant.id}`}
                    variant="subtitle1"
                    sx={{ fontWeight: 700, mb: 0.5 }}
                >
                    {restaurant.name}
                </Typography>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip
                        data-testid={`restaurant-rating-${restaurant.id}`}
                        label={`⭐ ${restaurant.averageRating ?? 4.5}`}
                        size="small"
                        variant="outlined"
                    />
                    <Chip
                        data-testid={`restaurant-delivery-${restaurant.id}`}
                        label={`${restaurant.deliveryTimeEstimate ?? 30} min`}
                        size="small"
                        variant="outlined"
                    />
                    <Chip
                        data-testid={`restaurant-status-${restaurant.id}`}
                        label={isOpenNow ? "Open" : "Closed"}
                        color={isOpenNow ? "success" : "default"}
                        size="small"
                    />
                </Box>
            </CardContent>

            <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
                <Button
                    data-testid={`restaurant-view-${restaurant.id}`}
                    size="small"
                    variant="contained"
                    component={Link}
                    to={`/restaurants/${restaurant.id}`}
                    fullWidth
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                >
                    View Menu
                </Button>
            </CardActions>
        </Card>
    );
};

/* ---------- Page ---------- */
const HomePage = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    useEffect(() => {
        let active = true;
        restaurantRepository
            .findAll()
            .then((res) => {
                if (!active) return;
                setRestaurants(res.data || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
        return () => {
            active = false;
        };
    }, []);

    const categories = useMemo(() => {
        const set = new Set(
            (restaurants || [])
                .map((r) => (r.category || "").trim())
                .filter(Boolean)
        );
        return ["All", ...[...set].sort()];
    }, [restaurants]);

    const filtered = restaurants.filter((r) => {
        const matchesSearch = (r.name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesCategory =
            activeCategory === "All" ||
            (r.category || "").toLowerCase() === activeCategory.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    if (loading) return <Typography>Loading restaurants...</Typography>;

    return (
        <Box data-testid="home-page">
            {/* HERO */}
            <Box
                data-testid="home-hero"
                sx={{
                    position: "relative",
                    mx: "calc(50% - 50dvw)",
                    width: "99.5dvw",
                    height: { xs: 280, md: 420 },
                    mb: 6,
                    backgroundImage: `url(${banner})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45))",
                    }}
                />
                <Box
                    sx={{
                        position: "relative",
                        zIndex: 1,
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Box sx={{ width: "min(720px, 92vw)", textAlign: "center" }}>
                        <Typography
                            variant="h3"
                            sx={{ fontWeight: 800, color: "#fff", mb: 2 }}
                        >
                            Feast Your Senses,{" "}
                            <Box component="span" sx={{ color: "#f97316" }}>
                                Fast and Fresh
                            </Box>
                        </Typography>

                        <TextField
                            data-testid="home-search-input"
                            fullWidth
                            placeholder="Search for restaurants…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ background: "#fff", borderRadius: 2 }}
                        />
                    </Box>
                </Box>
            </Box>

            {/* FILTER CHIPS */}
            <Box sx={{ mb: 3, display: "flex", gap: 1, overflowX: "auto" }}>
                {categories.map((cat) => (
                    <Chip
                        key={cat}
                        data-testid={`home-category-${cat}`}
                        label={cat}
                        onClick={() => setActiveCategory(cat)}
                        clickable
                        color={cat === activeCategory ? "primary" : "default"}
                    />
                ))}
            </Box>

            {/* LIST */}
            <Typography sx={{ fontWeight: 800, mb: 3 }}>
                Browse Restaurants
            </Typography>

            <Box
                data-testid="restaurant-grid"
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        md: "repeat(3, 1fr)",
                        lg: "repeat(4, 1fr)",
                    },
                    gap: 3,
                }}
            >
                {filtered.map((restaurant) => (
                    <RestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                    />
                ))}
            </Box>

            {!filtered.length && (
                <Typography
                    data-testid="home-empty-state"
                    color="text.secondary"
                    sx={{ textAlign: "center", mt: 4 }}
                >
                    No restaurants match “{searchTerm}”
                    {activeCategory !== "All" ? ` in ${activeCategory}` : ""}.
                </Typography>
            )}
        </Box>
    );
};

export default HomePage;
