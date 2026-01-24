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
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import productRepository from "../../../../repository/productRepository.js";
import restaurantRepository from "../../../../repository/restaurantRepository.js";

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [restaurantId, setRestaurantId] = useState("");
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(true);

    const [openDialog, setOpenDialog] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        let live = true;
        Promise.all([
            productRepository.findAll(),
            restaurantRepository.findAll(),
        ])
            .then(([p, r]) => {
                if (!live) return;
                setProducts(p?.data || []);
                setRestaurants(r?.data || []);
            })
            .finally(() => live && setLoading(false));
        return () => {
            live = false;
        };
    }, []);

    const filtered = useMemo(() => {
        let list = products;
        if (restaurantId) {
            list = list.filter(
                (p) => String(p.restaurantId) === String(restaurantId)
            );
        }
        const s = q.trim().toLowerCase();
        if (s) {
            list = list.filter(
                (p) =>
                    p.name?.toLowerCase().includes(s) ||
                    p.description?.toLowerCase().includes(s) ||
                    p.category?.toLowerCase().includes(s)
            );
        }
        return list;
    }, [products, restaurantId, q]);

    const onAdd = () => {
        setEditingProduct({
            name: "",
            description: "",
            category: "",
            price: "",
            quantity: "",
            restaurantId: "",
            isAvailable: true,
        });
        setErrors({});
        setOpenDialog(true);
    };

    const onEdit = (p) => {
        setEditingProduct({ ...p });
        setErrors({});
        setOpenDialog(true);
    };

    const onDelete = async (p) => {
        if (!window.confirm(`Delete "${p.name}"?`)) return;
        await productRepository.remove(p.id);
        setProducts((prev) => prev.filter((x) => x.id !== p.id));
    };

    const handleSave = async () => {
        const errs = {};
        if (!editingProduct.name) errs.name = "Name required";
        if (!editingProduct.restaurantId) errs.restaurantId = "Restaurant required";
        if (Object.keys(errs).length) return setErrors(errs);

        if (editingProduct.id) {
            const res = await productRepository.edit(editingProduct.id, editingProduct);
            setProducts((prev) =>
                prev.map((p) => (p.id === editingProduct.id ? res.data : p))
            );
        } else {
            const res = await productRepository.add(editingProduct);
            setProducts((prev) => [...prev, res.data]);
        }
        setOpenDialog(false);
    };

    return (
        <Box data-testid="admin-products-page">
            {/* Toolbar */}
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                <Typography variant="h4" sx={{ mr: "auto", fontWeight: 800 }}>
                    Product Management
                </Typography>

                <TextField
                    select
                    data-testid="admin-products-restaurant-filter"
                    value={restaurantId}
                    onChange={(e) => setRestaurantId(e.target.value)}
                    sx={{ minWidth: 240 }}
                >
                    <MenuItem value="">All restaurants</MenuItem>
                    {restaurants.map((r) => (
                        <MenuItem key={r.id} value={r.id}>
                            {r.name}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    data-testid="admin-products-search-input"
                    placeholder="Search products…"
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

                <Button
                    data-testid="admin-products-add-btn"
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={onAdd}
                >
                    Add Product
                </Button>
            </Box>

            {/* Table */}
            <TableContainer
                data-testid="admin-products-table"
                component={Paper}
            >
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Restaurant</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Available</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.map((p) => (
                            <TableRow
                                key={p.id}
                                data-testid={`admin-product-row-${p.id}`}
                            >
                                <TableCell>{p.name}</TableCell>
                                <TableCell>
                                    {restaurants.find(r => r.id === p.restaurantId)?.name}
                                </TableCell>
                                <TableCell>{p.category}</TableCell>
                                <TableCell>{p.price}</TableCell>
                                <TableCell>{p.quantity}</TableCell>
                                <TableCell>
                                    <Chip
                                        data-testid={`admin-product-available-${p.id}`}
                                        label={p.isAvailable ? "Yes" : "No"}
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        data-testid={`admin-product-edit-${p.id}`}
                                        onClick={() => onEdit(p)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        data-testid={`admin-product-delete-${p.id}`}
                                        onClick={() => onDelete(p)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog */}
            <Dialog
                data-testid="admin-product-dialog"
                open={openDialog}
                onClose={() => setOpenDialog(false)}
            >
                <DialogTitle>
                    {editingProduct?.id ? "Edit Product" : "Add Product"}
                </DialogTitle>
                <DialogContent sx={{ display: "grid", gap: 2 }}>
                    <TextField
                        data-testid="admin-product-name-input"
                        label="Name"
                        value={editingProduct?.name || ""}
                        onChange={(e) =>
                            setEditingProduct({ ...editingProduct, name: e.target.value })
                        }
                        error={!!errors.name}
                        helperText={errors.name}
                    />
                    <TextField
                        data-testid="admin-product-description-input"
                        label="Description"
                        value={editingProduct?.description || ""}
                        onChange={(e) =>
                            setEditingProduct({ ...editingProduct, description: e.target.value })
                        }
                    />
                    <TextField
                        data-testid="admin-product-price-input"
                        label="Price"
                        type="number"
                        value={editingProduct?.price || ""}
                        onChange={(e) =>
                            setEditingProduct({ ...editingProduct, price: e.target.value })
                        }
                    />
                    <TextField
                        select
                        data-testid="admin-product-restaurant-select"
                        label="Restaurant"
                        value={editingProduct?.restaurantId || ""}
                        onChange={(e) =>
                            setEditingProduct({ ...editingProduct, restaurantId: e.target.value })
                        }
                    >
                        {restaurants.map((r) => (
                            <MenuItem key={r.id} value={r.id}>
                                {r.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button data-testid="admin-product-cancel-btn" onClick={() => setOpenDialog(false)}>
                        Cancel
                    </Button>
                    <Button
                        data-testid="admin-product-save-btn"
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

export default AdminProducts;
