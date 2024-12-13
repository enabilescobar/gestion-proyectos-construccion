// frontend/src/components/Home.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode} from 'jwt-decode';
import Navbar from './Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';

const Home = () => {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        // Decodificar el token para obtener el rol
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserRole(decoded.role);
            } catch (error) {
                console.error('Error al decodificar el token:', error);
            }
        }
    }, []);

    return (
        <div>
            <Navbar />
            <div className="container mt-5">
                <div className="text-center">
                    <h1>¡Bienvenido!</h1>
                    <p className="lead">Has iniciado sesión con éxito. Elige una opción para continuar:</p>
                </div>
                <div className="row justify-content-center mt-4">
                    <div className="col-md-4">
                        <div className="card">
                            <div className="card-body text-center">
                                <h5 className="card-title">Administrar Proyectos</h5>
                                <p className="card-text">Administra todos los proyectos existentes o crea nuevos.</p>
                                <a href="/proyectos-admin" className="btn btn-primary">Ir a Proyectos</a>
                            </div>
                        </div>
                    </div>
                    {/* Mostrar botón solo para admin o manager */}
                    {(userRole === 'admin' || userRole === 'manager') && (
                        <div className="col-md-4">
                            <div className="card">
                                <div className="card-body text-center">
                                    <h5 className="card-title">Administrar Usuarios</h5>
                                    <p className="card-text">Administra los usuarios de la plataforma o crea nuevos.</p>
                                    <a href="/AdministrarUsuarios" className="btn btn-primary">Ir a Usuarios</a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
