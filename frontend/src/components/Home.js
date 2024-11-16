import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Home = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Eliminar el token del almacenamiento local
        localStorage.removeItem('token');
        // Redirigir a la página de inicio de sesión
        navigate('/login');
    };

    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#">Gestión de Proyectos</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <button className="btn btn-outline-light" onClick={handleLogout}>Cerrar sesión</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

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
                                <a href="/proyectos" className="btn btn-primary">Ir a Proyectos</a>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card">
                            <div className="card-body text-center">
                                <h5 className="card-title">Administrar Usuarios</h5>
                                <p className="card-text">Administra los usuarios de la plataforma.</p>
                                <a href="/usuarios" className="btn btn-secondary">Ir a Usuarios</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
