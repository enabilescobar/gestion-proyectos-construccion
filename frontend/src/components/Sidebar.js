import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';  // Importar jwtDecode para decodificar el token

const Sidebar = () => {
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        // Obtener el token del localStorage y decodificarlo para obtener el rol
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserRole(decoded.role);  // Establecer el rol del usuario
            } catch (error) {
                console.error('Error al decodificar el token:', error);
            }
        }
    }, []);

    return (
        <div className="sidebar bg-dark text-white p-3" style={{ height: '100vh' }}>
            <h3>Construcciones</h3>
            <h3>GUARDADO</h3>
            <ul className="nav flex-column">
                <li className="nav-item">
                    <Link to="/home" className="nav-link text-white">Inicio</Link>
                </li>
                <li className="nav-item">
                    <Link to="/proyectos-admin" className="nav-link text-white">Proyectos</Link>
                </li>

                {/* Mostrar el enlace de Usuarios solo si el rol es 'admin' o 'manager' */}
                {(userRole === 'admin' || userRole === 'manager') && (
                    <li className="nav-item">
                        <Link to="/AdministrarUsuarios" className="nav-link text-white">Usuarios</Link>
                    </li>
                )}

                {/* Mostrar el enlace de Reportes solo si el rol es 'admin' o 'manager' */}
                {(userRole === 'admin' || userRole === 'manager') && (
                    <li className="nav-item">
                        <Link to="/en-construccion" className="nav-link text-white">Reportes</Link>
                    </li>
                )}
            </ul>
        </div>
    );
};

export default Sidebar;
