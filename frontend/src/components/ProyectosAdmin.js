// frontend/src/components/ProyectosAdmin.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar'; 
import 'bootstrap/dist/css/bootstrap.min.css';

const ProyectosAdmin = () => {
    const [proyectosPendientes, setProyectosPendientes] = useState([]);
    const [proyectosEnProceso, setProyectosEnProceso] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // Obtener proyectos
    const fetchProyectos = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setMessage('No se encontró un token válido. Por favor, inicia sesión nuevamente.');
                return;
            }

            const response = await axios.get('http://localhost:5000/api/projects', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const proyectos = response.data;
            setProyectosPendientes(proyectos.filter(proyecto => proyecto.status === 'Pendiente'));
            setProyectosEnProceso(proyectos.filter(proyecto => proyecto.status === 'En Proceso'));
            setLoading(false);
        } catch (error) {
            console.error('Error al obtener los proyectos:', error);
            setMessage('Error al obtener los proyectos');
            setLoading(false);
        }
    };

    // Obtener proyectos al cargar
    useEffect(() => {
        fetchProyectos();
    }, []);

    const handleVerProyecto = (id) => {
        navigate(`/proyectos/${id}`);
    };

    const handleRegresar = () => {
        navigate('/home'); // Redirigir a la página de inicio
    };

    return (
        <div>
            <Navbar />
            <div className="container mt-4">
                <h2 className="text-center mb-4">Administración de Proyectos</h2>
                {message && <div className="alert alert-info">{message}</div>}

                {/* Proyectos en Proceso */}
                <h4>Proyectos en Proceso</h4>
                {loading ? (
                    <div className="d-flex justify-content-center">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                    </div>
                ) : (
                    <table className="table table-bordered mb-4">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proyectosEnProceso.length > 0 ? (
                                proyectosEnProceso.map(proyecto => (
                                    <tr key={proyecto._id}>
                                        <td>{proyecto.nombreProyecto}</td>
                                        <td>{proyecto.descripcion}</td>
                                        <td>
                                            <button
                                                className="btn btn-info"
                                                onClick={() => handleVerProyecto(proyecto._id)}
                                            >
                                                Ver Proyecto
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center">
                                        No hay proyectos en proceso
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}

                {/* Proyectos Pendientes */}
                <h4>Proyectos Pendientes</h4>
                {loading ? (
                    <div className="d-flex justify-content-center">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                    </div>
                ) : (
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proyectosPendientes.length > 0 ? (
                                proyectosPendientes.map(proyecto => (
                                    <tr key={proyecto._id}>
                                        <td>{proyecto.nombreProyecto}</td>
                                        <td>{proyecto.descripcion}</td>
                                        <td>
                                            <button
                                                className="btn btn-info"
                                                onClick={() => handleVerProyecto(proyecto._id)}
                                            >
                                                Ver Proyecto
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center">
                                        No hay proyectos pendientes
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}

                {/* Botones de acciones */}
                <div className="mb-4 d-flex justify-content-between">
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/proyectos/agregar')}
                    >
                        Agregar Proyecto
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate('/proyectos')}
                    >
                        Ver Proyectos
                    </button>
                    <button
                        className="btn btn-outline-dark"
                        onClick={handleRegresar}
                    >
                        Regresar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProyectosAdmin;
