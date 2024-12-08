// frontend/src/components/Home.js
import React from 'react';
import Navbar from './Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';

const Home = () => {
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
                    <div className="col-md-4">
                        <div className="card">
                            <div className="card-body text-center">
                                <h5 className="card-title">Administrar Usuarios</h5>
                                <p className="card-text">Administra los usuarios de la plataforma o crea nuevos.</p>
                                <a href="/AdministrarUsuarios" className="btn btn-primary">Ir a Usuarios</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
