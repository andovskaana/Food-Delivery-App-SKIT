import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Rating,
    Typography
} from "@mui/material";

const ReviewList = ({ reviews }) => {
    if (!reviews?.length) {
        return (
            <Typography
                data-testid="review-list-empty"
                color="text.secondary"
            >
                No reviews yet.
            </Typography>
        );
    }

    return (
        <Box
            data-testid="review-list"
            sx={{ display: 'grid', gap: 1 }}
        >
            {reviews.map((r, idx) => (
                <Card
                    key={idx}
                    data-testid={`review-item-${idx}`}
                >
                    <CardContent>
                        <Rating
                            data-testid={`review-rating-${idx}`}
                            readOnly
                            value={r.rating}
                            max={5}
                        />

                        {r.comment && (
                            <Typography sx={{ mt: 1 }}>
                                {r.comment}
                            </Typography>
                        )}

                        <Typography
                            data-testid={`review-author-${idx}`}
                            variant="caption"
                            color="text.secondary"
                        >
                            {r.username || r.user || ""}
                        </Typography>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
};

export default ReviewList;
