import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Typography,
    TextField,
    InputAdornment,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import restaurantRepository from "../../../../repository/restaurantRepository.js";

const AdminRestaurants = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(true);

    const [openDialog, setOpenDialog] = useState(false);
    const [editing, setEditing] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        let live = true;
        restaurantRepository
            .findAll()
            .then((res) => live && setRestaurants(res?.data || []))
            .finally(() => live && setLoading(false));
        return () => {
            live = false;
        };
    }, []);

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return restaurants;
        return restaurants.filter(
            (r) =>
                r.name?.toLowerCase().includes(s) ||
                r.description?.toLowerCase().includes(s)
        );
    }, [restaurants, q]);

    const validate = (restaurant) => {
        const newErrors = {};
        if (!restaurant.name?.trim()) newErrors.name = "Name is required";
        if (!restaurant.deliveryTimeEstimate || restaurant.deliveryTimeEstimate <= 0)
            newErrors.deliveryTimeEstimate = "Delivery time must be greater than 0";
        return newErrors;
    };

    const onAdd = () => {
        setEditing({
            name: "",
            description: "",
            openHours: "",
            imageUrl: "",
            averageRating: 4.5,
            deliveryTimeEstimate: 30,
            isOpen: true,
        });
        setErrors({});
        setOpenDialog(true);
    };

    const onEdit = (r) => {
        setEditing({ ...r });
        setErrors({});
        setOpenDialog(true);
    };

    const onDelete = async (r) => {
        if (!window.confirm(`Delete "${r.name}"?`)) return;
        await restaurantRepository.remove(r.id);
        setRestaurants((prev) => prev.filter((x) => x.id !== r.id));
    };

    const handleSave = async () => {
        const validationErrors = validate(editing);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        if (editing?.id) {
            const res = await restaurantRepository.edit(editing.id, editing);
            setRestaurants((prev) =>
                prev.map((x) => (x.id === editing.id ? res.data : x))
            );
        } else {
            const res = await restaurantRepository.add(editing);
            setRestaurants((prev) => [...prev, res.data]);
        }
        setOpenDialog(false);
    };

    const isRestaurantOpen = (r) => {
        if (!r.openHours) return r.isOpen;
        try {
            const [start, end] = r.openHours.split("-").map((s) => s.trim());
            const [sh, sm] = start.split(":").map(Number);
            const [eh, em] = end.split(":").map(Number);
            const now = new Date();
            const nowMin = now.getHours() * 60 + now.getMinutes();
            const startMin = sh * 60 + (sm || 0);
            const endMin = eh * 60 + (em || 0);

            return startMin < endMin
                ? nowMin >= startMin && nowMin <= endMin
                : nowMin >= startMin || nowMin <= endMin;
        } catch {
            return r.isOpen;
        }
    };

    return (
        <Box data-testid="admin-restaurants-page">
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                <Typography variant="h4" sx={{ fontWeight: 800, mr: "auto" }}>
                    Restaurant Management
                </Typography>

                <TextField
                    data-testid="admin-restaurants-search-input"
                    placeholder="Search restaurants…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            <Button
                data-testid="admin-restaurants-add-btn"
                onClick={onAdd}
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ mb: 3 }}
            >
                Add Restaurant
            </Button>

            <TableContainer
                data-testid="admin-restaurants-table"
                component={Paper}
            >
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Open Hours</TableCell>
                            <TableCell>Delivery Time</TableCell>
                            <TableCell>Rating</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.map((r) => (
                            <TableRow
                                key={r.id}
                                data-testid={`admin-restaurant-row-${r.id}`}
                            >
                                <TableCell>{r.name}</TableCell>
                                <TableCell>{r.description}</TableCell>
                                <TableCell>{r.openHours}</TableCell>
                                <TableCell>{r.deliveryTimeEstimate} min</TableCell>
                                <TableCell>{r.averageRating}</TableCell>
                                <TableCell>
                                    <Chip
                                        data-testid={`admin-restaurant-status-${r.id}`}
                                        label={isRestaurantOpen(r) ? "Open" : "Closed"}
                                        color={isRestaurantOpen(r) ? "success" : "default"}
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        data-testid={`admin-restaurant-edit-${r.id}`}
                                        onClick={() => onEdit(r)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        data-testid={`admin-restaurant-delete-${r.id}`}
                                        onClick={() => onDelete(r)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                data-testid="admin-restaurant-dialog"
                open={openDialog}
                onClose={() => setOpenDialog(false)}
            >
                <DialogTitle>
                    {editing?.id ? "Edit Restaurant" : "Add Restaurant"}
                </DialogTitle>
                <DialogContent sx={{ display: "grid", gap: 2 }}>
                    <TextField
                        data-testid="admin-restaurant-name-input"
                        label="Name"
                        value={editing?.name || ""}
                        onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                        error={!!errors.name}
                        helperText={errors.name}
                    />
                    <TextField
                        data-testid="admin-restaurant-description-input"
                        label="Description"
                        value={editing?.description || ""}
                        onChange={(e) =>
                            setEditing({ ...editing, description: e.target.value })
                        }
                    />
                    <TextField
                        data-testid="admin-restaurant-openhours-input"
                        label="Open hours"
                        value={editing?.openHours || ""}
                        onChange={(e) =>
                            setEditing({ ...editing, openHours: e.target.value })
                        }
                    />
                    <TextField
                        data-testid="admin-restaurant-rating-input"
                        label="Average rating"
                        type="number"
                        value={editing?.averageRating ?? ""}
                        onChange={(e) =>
                            setEditing({
                                ...editing,
                                averageRating: Number(e.target.value),
                            })
                        }
                    />
                    <TextField
                        data-testid="admin-restaurant-image-input"
                        label="Image URL"
                        value={editing?.imageUrl || ""}
                        onChange={(e) =>
                            setEditing({ ...editing, imageUrl: e.target.value })
                        }
                    />
                    <TextField
                        data-testid="admin-restaurant-deliverytime-input"
                        label="Delivery Time (minutes)"
                        type="number"
                        value={editing?.deliveryTimeEstimate ?? ""}
                        onChange={(e) =>
                            setEditing({
                                ...editing,
                                deliveryTimeEstimate: Number(e.target.value),
                            })
                        }
                        error={!!errors.deliveryTimeEstimate}
                        helperText={errors.deliveryTimeEstimate}
                    />
                    <TextField
                        select
                        data-testid="admin-restaurant-status-select"
                        label="Status"
                        value={editing?.isOpen ? "open" : "closed"}
                        onChange={(e) =>
                            setEditing({
                                ...editing,
                                isOpen: e.target.value === "open",
                            })
                        }
                    >
                        <MenuItem value="open">Open</MenuItem>
                        <MenuItem value="closed">Closed</MenuItem>
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button
                        data-testid="admin-restaurant-cancel-btn"
                        onClick={() => setOpenDialog(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        data-testid="admin-restaurant-save-btn"
                        variant="contained"
                        onClick={handleSave}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminRestaurants;
