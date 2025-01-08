// frontend/src/components/VerProyectos.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar'; 
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const VerProyectos = () => {
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
                <h2 className="text-center mb-4">Administracion de Proyectos</h2>
                {message && <div className="alert alert-info">{message}</div>}

                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map((project) => (
                            <tr key={project._id}>
                                <td>{project.nombreProyecto}</td>
                                <td>{project.descripcion}</td>
                                <td>{project.status}</td>
                                <td>
                                    <button
                                        className="btn btn-warning me-2"
                                        onClick={() => navigate(`/proyectos/${project._id}/editar`)}
                                    >
                                        Actualizar
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleDelete(project)}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mt-4 d-flex justify-content-between">
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/proyectos/agregar')}
                    >
                        Agregar Proyecto
                    </button>

                    <button className="btn btn-outline-dark" onClick={() => navigate('/proyectos-admin')}>
                        Regresar
                    </button>
                </div>

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
