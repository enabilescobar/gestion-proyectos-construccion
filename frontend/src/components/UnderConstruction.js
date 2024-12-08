// frontend/src/components/UnderConstruction.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar'; // Reutilizamos la barra de navegación

const UnderConstruction = () => {
    const navigate = useNavigate();

    return (
        <div>
            <Navbar />
            <div className="container text-center mt-5">
                <h1 className="display-4 text-warning">¡Página en Construcción!</h1>
                <p className="lead mt-4">Estamos trabajando arduamente para traer esta funcionalidad lo más pronto posible.</p>
                <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/home')} // Redirigir a la página principal
                >
                    Volver al Inicio
                </button>
            </div>
        </div>
    );
};

export default UnderConstruction;
