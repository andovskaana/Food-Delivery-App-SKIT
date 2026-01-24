import React from 'react';
import { Grid, Typography } from "@mui/material";
import ProductCard from "../ProductCard/ProductCard.jsx";

const ProductGrid = ({ items = [], onAdd }) => {
    if (!items.length) {
        return (
            <Typography
                data-testid="product-grid-empty"
                color="text.secondary"
                sx={{ mt: 2 }}
            >
                No products available.
            </Typography>
        );
    }

    return (
        <Grid
            data-testid="product-grid"
            container
            spacing={2}
        >
            {items.map(p => (
                <Grid
                    item
                    key={p.id}
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                >
                    <ProductCard p={p} onAdd={onAdd} />
                </Grid>
            ))}
        </Grid>
    );
};

export default ProductGrid;
