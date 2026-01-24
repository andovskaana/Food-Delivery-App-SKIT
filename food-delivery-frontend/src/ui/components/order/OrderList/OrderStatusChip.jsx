import React from 'react';
import { Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const OrderStatusChip = ({ status }) => {
    const getStatusConfig = (status) => {
        switch (status) {
            case 'PENDING':
                return { label: 'Pending', color: 'default', icon: <AccessTimeIcon /> };
            case 'CONFIRMED':
                return { label: 'Confirmed', color: 'info', icon: <CheckCircleIcon /> };
            case 'IN_PREPARATION':
                return { label: 'Preparing', color: 'warning', icon: <RestaurantIcon /> };
            case 'PICKED_UP':
            case 'EN_ROUTE':
                return { label: 'On the way', color: 'warning', icon: <LocalShippingIcon /> };
            case 'DELIVERED':
                return { label: 'Delivered', color: 'success', icon: <CheckCircleIcon /> };
            default:
                return { label: status, color: 'default', icon: null };
        }
    };

    const config = getStatusConfig(status);

    return (
        <Chip
            data-testid="order-status-chip"
            data-status={status}
            label={config.label}
            color={config.color}
            icon={config.icon}
            size="small"
            sx={{
                fontWeight: 'medium',
                '& .MuiChip-icon': {
                    fontSize: 16
                }
            }}
        />
    );
};

export default OrderStatusChip;
