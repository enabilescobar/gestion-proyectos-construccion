// frontend/src/components/VerProyectos.jspaginaActua
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Card, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const VerProyectos = () => {
    const [paginaActual, setPaginaActual] = useState(1);
    const [proyectosPorPagina, setProyectosPorPagina] = useState(10);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get('http://localhost:5000/api/projects', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProjects(response.data);
        } catch (error) {
            console.error('Error al obtener proyectos:', error);
        }
    };

    const handleDelete = (project) => {
        setSelectedProject(project);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.delete(`http://localhost:5000/api/projects/${selectedProject._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage(`Proyecto "${selectedProject.nombreProyecto}" eliminado con éxito.`);
            setShowDeleteModal(false);
            fetchProjects();
        } catch (error) {
            console.error('Error al eliminar el proyecto:', error);
            setMessage('Error al eliminar el proyecto.');
        }
    };

    return (
        <div>
            <div className="container mt-5">
                <Card className="shadow-sm p-4 mb-4">
                    <h2 className="text-center mb-4">Administración de Proyectos</h2>

                    {message && (
                        <div className="alert alert-success text-center fw-bold">
                        {message}
                        </div>
                    )}
                </Card>

                <Card className="shadow-sm p-4 mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                        <h4 className="mb-0">Proyectos Registrados</h4>

                        <div className="d-flex gap-3">
                        <Button
                            variant="primary"
                            size="md"
                            onClick={() => navigate('/proyectos/agregar')}
                        >
                            Agregar Proyecto
                        </Button>

                        <Button
                            variant="outline-dark"
                            size="md"
                            onClick={() => navigate('/proyectos-admin')}
                        >
                            Regresar
                        </Button>
                        </div>
                    </div>

                    <div className="d-flex justify-content-end mb-3">
                        <div>
                            <label className="me-2">Mostrar:</label>
                            <select
                            value={proyectosPorPagina}
                            onChange={(e) => {
                                setProyectosPorPagina(Number(e.target.value));
                                setPaginaActual(1);
                            }}
                            className="form-select d-inline-block w-auto"
                            >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            </select>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <Table hover borderless responsive className="align-middle text-center">
                        <thead className="table-dark">
                            <tr>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.length > 0 ? (
                            projects
                            .slice((paginaActual - 1) * proyectosPorPagina, paginaActual * proyectosPorPagina)
                            .map((project) => (
                              <tr key={project._id}>
                                <td>{project.nombreProyecto}</td>
                                <td>{project.descripcion}</td>
                                <td>
                                    <span className={`badge 
                                        ${project.status === 'Pendiente' ? 'bg-warning text-dark' :
                                        project.status === 'En Proceso' ? 'bg-primary' :
                                        project.status === 'Completado' ? 'bg-success' :
                                        project.status === 'Suspendido' ? 'bg-secondary' :
                                        project.status === 'Cancelado' ? 'bg-danger' : 'bg-light text-dark'
                                        }`}>
                                        {project.status}
                                    </span>
                                </td>
                                <td>
                                    <Button
                                    variant="warning"
                                    size="sm"
                                    className="me-2"
                                    onClick={() => navigate(`/proyectos/${project._id}/editar`)}
                                    >
                                    Actualizar
                                    </Button>
                                    <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDelete(project)}
                                    >
                                    Eliminar
                                    </Button>
                                </td>
                                </tr>
                            ))
                            ) : (
                            <tr>
                                <td colSpan="4" className="text-center">No hay proyectos disponibles.</td>
                            </tr>
                            )}
                        </tbody>
                        </Table>
                    </div>
                    
                    {projects.length > 0 && (
                        <div className="d-flex justify-content-center mt-4">
                            <nav>
                            <ul className="pagination">
                                <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setPaginaActual(paginaActual - 1)}>
                                    Anterior
                                </button>
                                </li>

                                {Array.from({ length: Math.ceil(projects.length / proyectosPorPagina) }, (_, i) => (
                                <li key={i} className={`page-item ${paginaActual === i + 1 ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => setPaginaActual(i + 1)}>
                                    {i + 1}
                                    </button>
                                </li>
                                ))}

                                <li className={`page-item ${paginaActual === Math.ceil(projects.length / proyectosPorPagina) ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setPaginaActual(paginaActual + 1)}>
                                    Siguiente
                                </button>
                                </li>
                            </ul>
                            </nav>
                        </div>
                    )}
                </Card>

                {/* Modal de Confirmación de Eliminación */}
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirmar Eliminación</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        ¿Está seguro que desea eliminar el proyecto **{selectedProject?.nombreProyecto}**?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                            Cancelar
                        </Button>
                        <Button variant="danger" onClick={confirmDelete}>
                            Aceptar
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
};

export default VerProyectos;
