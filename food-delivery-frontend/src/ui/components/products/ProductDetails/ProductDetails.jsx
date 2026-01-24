import React from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography
} from "@mui/material";

const ProductDetails = ({
                            details,
                            onAdd,
                            onRemove,
                            addButtonTestId = "product-details-add-btn",
                            removeButtonTestId = "product-details-remove-btn"
                        }) => {
    if (!details) return null;

    return (
        <Card data-testid="product-details">
            <CardContent>
                <Typography
                    data-testid="product-details-name"
                    variant="h4"
                >
                    {details.name}
                </Typography>

                <Typography sx={{ my: 1 }}>
                    {details.description}
                </Typography>

                <Typography
                    data-testid="product-details-price"
                    variant="h6"
                >
                    {details.price?.toFixed?.(2)} ден.
                </Typography>

                {details?.restaurant && (
                    <Box
                        data-testid="product-details-restaurant"
                        sx={{ mt: 2 }}
                    >
                        <Typography variant="subtitle2">
                            Restaurant
                        </Typography>
                        <Typography>
                            {details.restaurant.name}
                        </Typography>
                        <Typography color="text.secondary">
                            {details.restaurant.description}
                        </Typography>
                    </Box>
                )}

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                        data-testid={addButtonTestId}
                        variant="contained"
                        onClick={onAdd}
                    >
                        Add to cart
                    </Button>

                    <Button
                        data-testid={removeButtonTestId}
                        onClick={onRemove}
                    >
                        Remove
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ProductDetails;
