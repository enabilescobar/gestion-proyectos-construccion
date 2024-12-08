// frontend/src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('authToken'); // Verifica si el token existe

    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
