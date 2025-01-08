import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Sin llaves porque es un módulo por defecto

const PrivateRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Nuevo estado para autenticación
    const token = localStorage.getItem('authToken');
    
    useEffect(() => {
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                if (decodedToken.exp * 1000 < Date.now()) {
                    localStorage.removeItem('authToken');
                } else {
                    setIsAuthenticated(true); // Autenticación exitosa
                }
            } catch (error) {
                localStorage.removeItem('authToken');
            }
        }
        setLoading(false); // Finalizamos la carga en cualquier caso
    }, [token]);

    if (loading) {
        return <div>Loading...</div>; // O un spinner de carga
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default PrivateRoute;
