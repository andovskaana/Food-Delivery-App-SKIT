import React from 'react';
import useAuth from "../../../../hooks/useAuth.js";
import { Navigate, Outlet, useLocation } from "react-router";

const ProtectedRoute = ({ role }) => {
    const { isLoading, user } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <span
                data-testid="protected-loading"
                style={{ display: "none" }}
            />
        );
    }

    // Not logged in → go to login
    if (user === null) {
        return (
            <>
                <span
                    data-testid="protected-redirect-unauth"
                    style={{ display: "none" }}
                />
                <Navigate
                    to="/login"
                    replace
                    state={{ from: location.pathname + location.search }}
                />
            </>
        );
    }

    // Logged in but missing role
    if (role && !user.roles?.includes(role)) {
        return (
            <>
                <span
                    data-testid="protected-redirect-forbidden"
                    style={{ display: "none" }}
                />
                <Navigate
                    to="/login"
                    replace
                    state={{ from: location.pathname + location.search }}
                />
            </>
        );
    }

    return (
        <>
            <span
                data-testid="protected-allowed"
                style={{ display: "none" }}
            />
            <Outlet />
        </>
    );
};

export default ProtectedRoute;
