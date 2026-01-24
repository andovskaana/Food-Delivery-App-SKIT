import React from 'react';
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Button
} from "@mui/material";
import { Link } from "react-router";

const ProductCard = ({ p, onAdd }) => {
    if (!p) return null;

    return (
        <Card
            data-testid={`product-card-${p.id}`}
        >
            <CardContent>
                <Typography
                    data-testid={`product-card-name-${p.id}`}
                    variant="h6"
                >
                    {p.name}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    {p.description}
                </Typography>

                <Typography
                    data-testid={`product-card-price-${p.id}`}
                    variant="subtitle1"
                    sx={{ mt: 1 }}
                >
                    {p.price?.toFixed?.(2)} ден.
                </Typography>
            </CardContent>

            <CardActions>
                <Button
                    data-testid={`product-card-details-${p.id}`}
                    size="small"
                    component={Link}
                    to={`/products/${p.id}`}
                >
                    Details
                </Button>

                {onAdd && (
                    <Button
                        data-testid={`product-card-add-${p.id}`}
                        size="small"
                        onClick={() => onAdd(p.id)}
                    >
                        Add to cart
                    </Button>
                )}
            </CardActions>
        </Card>
    );
};

export default ProductCard;
