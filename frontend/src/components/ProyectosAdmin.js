import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Table, Form, Row, Col, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { jwtDecode } from 'jwt-decode';
import moment from 'moment';

const ProyectosAdmin = () => {
    const [proyectos, setProyectos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [userRole, setUserRole] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroPrioridad, setFiltroPrioridad] = useState('');
    const navigate = useNavigate();
    const [paginaActual, setPaginaActual] = useState(1);
    const [proyectosPorPagina, setProyectosPorPagina] = useState(10);
    
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
            setProyectos(proyectos);
        } catch (error) {
            console.error('Error al obtener los proyectos:', error);
            setMessage('Error al obtener los proyectos');
        } finally {
            setLoading(false);
        }
    };

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

    const handleRowClick = (id) => {
        navigate(`/proyectos/${id}`);
    };

    const handleRegresar = () => {
        navigate('/home');
    };

    const proyectosFiltrados = proyectos.filter(p =>
        (filtroEstado === '' || p.status === filtroEstado) &&
        (filtroPrioridad === '' || p.prioridad === filtroPrioridad)
    );

    const indiceUltimo = paginaActual * proyectosPorPagina;
    const indicePrimero = indiceUltimo - proyectosPorPagina;
    const proyectosPaginados = proyectosFiltrados.slice(indicePrimero, indiceUltimo);
    const totalPaginas = Math.ceil(proyectosFiltrados.length / proyectosPorPagina);
    
    const cambiarPagina = (pagina) => {
        if (pagina > 0 && pagina <= totalPaginas) {
            setPaginaActual(pagina);
        }
    };
    
    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '20px' }}>
            <Container fluid>
                <h2 className="text-center mb-4">Administración de Proyectos</h2>

                {message && <div className="alert alert-info">{message}</div>}

                <Row className="mb-4">
                    <Col md={6}>
                        <Form.Group controlId="filtroEstado">
                            <Form.Label>Filtrar por Estado</Form.Label>
                            <Form.Select
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                            >
                                <option value="">Todos</option>
                                <option value="Pendiente">Pendiente</option>
                                <option value="En Proceso">En Proceso</option>
                                <option value="Completado">Completado</option>
                                <option value="Suspendido">Suspendido</option>
                                <option value="Cancelado">Cancelado</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group controlId="filtroPrioridad">
                            <Form.Label>Filtrar por Prioridad</Form.Label>
                            <Form.Select
                                value={filtroPrioridad}
                                onChange={(e) => setFiltroPrioridad(e.target.value)}
                            >
                                <option value="">Todas</option>
                                <option value="Alta">Alta</option>
                                <option value="Media">Media</option>
                                <option value="Baja">Baja</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                {loading ? (
                    <div className="d-flex justify-content-center">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <Row className="mb-3">
                            <Col md="auto">
                                <Form.Label>Mostrar:</Form.Label>
                                <Form.Select
                                    value={proyectosPorPagina}
                                    onChange={(e) => {
                                        setProyectosPorPagina(Number(e.target.value));
                                        setPaginaActual(1); // Reiniciar a la página 1
                                    }}
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={100}>100</option>
                                </Form.Select>
                            </Col>
                        </Row>
                        <Table hover bordered className="align-middle text-center table-striped shadow-sm">
                            <thead className="table-dark">
                                <tr>
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th>Estado</th>
                                    <th>Prioridad</th>
                                    <th>Avance</th>
                                    <th>Encargado</th>
                                    <th>Fecha de Inicio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {proyectosFiltrados.length > 0 ? (
                                    proyectosPaginados.map((proyecto) => (
                                        <tr
                                            key={proyecto._id}
                                            onClick={() => handleRowClick(proyecto._id)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <td>{proyecto.nombreProyecto}</td>
                                            <td>{proyecto.descripcion || 'Sin descripción'}</td>
                                            <td>{proyecto.status}</td>
                                            <td>{proyecto.prioridad}</td>
                                            <td>{proyecto.avance ?? 0}%</td>
                                            <td>{proyecto.encargado?.nombre || 'N/D'}</td>
                                            <td>{moment(proyecto.fechaInicio).format('DD/MM/YYYY')}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center">No hay proyectos disponibles.</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                        {totalPaginas > 1 && (
                        <div className="d-flex justify-content-center my-3">
                            <nav>
                                <ul className="pagination">
                                    <li className={`page-item ${paginaActual === 1 && 'disabled'}`}>
                                        <button className="page-link" onClick={() => cambiarPagina(paginaActual - 1)}>Anterior</button>
                                    </li>
                                    {Array.from({ length: totalPaginas }, (_, i) => (
                                        <li key={i} className={`page-item ${paginaActual === i + 1 ? 'active' : ''}`}>
                                            <button className="page-link" onClick={() => cambiarPagina(i + 1)}>{i + 1}</button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${paginaActual === totalPaginas && 'disabled'}`}>
                                        <button className="page-link" onClick={() => cambiarPagina(paginaActual + 1)}>Siguiente</button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                    </div>
                )}
                <div className="d-flex justify-content-between mt-4">
                    {userRole !== 'user' && (
                        <button className="btn btn-secondary" onClick={() => navigate('/proyectos')}>
                            Administrar Proyectos
                        </button>
                    )}
                    <button className="btn btn-outline-dark" onClick={handleRegresar}>
                        Regresar
                    </button>
                </div>
            </Container>
        </div>
    );
};

export default ProyectosAdmin;
