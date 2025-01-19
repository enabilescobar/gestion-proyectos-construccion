import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { jwtDecode } from 'jwt-decode';

const ProyectosAdmin = () => {
    const [proyectosPendientes, setProyectosPendientes] = useState([]);
    const [proyectosEnProceso, setProyectosEnProceso] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [userRole, setUserRole] = useState(''); 
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

    // Obtener rol del usuario autenticado
    const fetchUserRole = () => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUserRole(decodedToken.role);
            } catch (error) {
                console.error('Error al decodificar el token:', error);
            }
        }
    };

    useEffect(() => {
        fetchProyectos();
        fetchUserRole();
    }, []);

    const handleVerProyecto = (id) => {
        navigate(`/proyectos/${id}`);
    };

    const handleRegresar = () => {
        navigate('/home'); // Redirigir a la página de inicio
    };

    return (
        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}> {/* Color de fondo fuera del borde */}
            <h2 className="text-center mb-4">Proyectos en Curso</h2>
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
                <Table striped bordered hover className="table table-bordered mb-4">
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
                                            Ver Detalles
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
                </Table>
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
                <Table striped bordered hover className="table table-bordered">
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
                                            Ver Detalles
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
                </Table>
            )}

            {/* Botones de acciones */}
            <div className="d-flex justify-content-between mt-4">
                {/* Mostrar el botón "Administrar Proyectos" solo si el usuario no es "user" */}
                {userRole !== 'user' && (
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate('/proyectos')}
                    >
                        Administrar Proyectos
                    </button>
                )}
                <button
                    className="btn btn-outline-dark"
                    onClick={handleRegresar}
                >
                    Regresar
                </button>
            </div>
        </div>        
    );
};

export default ProyectosAdmin;
