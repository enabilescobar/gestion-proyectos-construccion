// frontend/src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Cambio: Importación corregida de jwtDecode

const Navbar = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');

    useEffect(() => {
        // Obtener el token y decodificar el nombre del usuario
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUsername(decodedToken.username || 'Usuario'); // Cambio: Decodificación de username
            } catch (error) {
                console.error('Error al decodificar el token:', error);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authToken'); 
        navigate('/login');
    };

    const handleChangePassword = () => {
        navigate('/CambiarPassword'); // Redirección para cambiar contraseña del usuario autenticado
    };

    const handleHome = () => {
        navigate('/home');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container-fluid">
                <a className="navbar-brand" href="#">
                    *** Construcciones "GUARDADO" *** {username && <span>- Bienvenido/a, {username}!</span>}
                </a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Opciones
                            </a>
                            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                                <li><button className="dropdown-item" onClick={handleHome}>Inicio</button></li>
                                <li><button className="dropdown-item" onClick={handleChangePassword}>Cambiar Contraseña</button></li>
                                <li><button className="dropdown-item text-danger" onClick={handleLogout}>Cerrar Sesión</button></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
