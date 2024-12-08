// frontend/src/components/EditarProyecto.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const EditarProyecto = () => {
    const { id } = useParams();
    const [proyecto, setProyecto] = useState({
        nombreProyecto: '',
        descripcion: '',
        fechaInicio: '',
        fechaFin: '',
        status: 'Pendiente',
    });
    const [tareas, setTareas] = useState([]);
    const [gastos, setGastos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeletingTask, setIsDeletingTask] = useState(true); 
    const navigate = useNavigate();

    useEffect(() => {
        fetchProyecto();
    }, []);

    const fetchProyecto = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`http://localhost:5000/api/projects/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const proyectoData = response.data;

            setProyecto({
                ...proyectoData,
                fechaInicio: proyectoData.fechaInicio ? proyectoData.fechaInicio.split('T')[0] : '',
                fechaFin: proyectoData.fechaFin ? proyectoData.fechaFin.split('T')[0] : '',
            });

            const tareasResponse = await axios.get(`http://localhost:5000/api/tasks/proyecto/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTareas(tareasResponse.data);

            const gastosResponse = await axios.get(`http://localhost:5000/api/gastos/project/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGastos(gastosResponse.data);
        } catch (error) {
            console.error('Error al obtener los datos del proyecto:', error);
            setMessage('Error al cargar los datos del proyecto');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (item, isTask) => {
        setSelectedItem(item);
        setIsDeletingTask(isTask);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const url = isDeletingTask
                ? `http://localhost:5000/api/tasks/${selectedItem._id}`
                : `http://localhost:5000/api/gastos/${selectedItem._id}`;

            await axios.delete(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setMessage(isDeletingTask ? 'Tarea eliminada con éxito.' : 'Gasto eliminado con éxito.');
            fetchProyecto(); // Recargar datos después de la eliminación
        } catch (error) {
            console.error('Error al eliminar:', error);
            setMessage('Error al eliminar el elemento.');
        } finally {
            setShowDeleteModal(false);
        }
    };

    const handleEdit = (item, isTask) => {
        const path = isTask ? 'editar-tarea' : 'editar-gasto';
        navigate(`/proyectos/${id}/${path}/${item._id}`);
    };

    const handleEditProyecto = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('authToken');
            await axios.put(`http://localhost:5000/api/projects/${id}`, proyecto, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage('Proyecto actualizado con éxito');
        } catch (error) {
            console.error('Error al actualizar el proyecto:', error);
            setMessage('Error al actualizar el proyecto');
        }
    };

    return (
        <div>
            <Navbar />
            <div className="container mt-5">
                <h2 className="text-center mb-4">Editar Proyecto</h2>
                {message && <div className="alert alert-info">{message}</div>}

                {loading ? (
                    <div className="text-center">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <form onSubmit={handleEditProyecto} className="mb-4">
                            {/* Formulario de edición del proyecto */}
                            <div className="mb-3">
                                <label>Nombre del Proyecto</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={proyecto.nombreProyecto}
                                    onChange={(e) => setProyecto({ ...proyecto, nombreProyecto: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label>Descripción</label>
                                <textarea
                                    className="form-control"
                                    value={proyecto.descripcion}
                                    onChange={(e) => setProyecto({ ...proyecto, descripcion: e.target.value })}
                                    required
                                ></textarea>
                            </div>
                            <div className="mb-3">
                                <label>Fecha de Inicio</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={proyecto.fechaInicio}
                                    onChange={(e) => setProyecto({ ...proyecto, fechaInicio: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label>Fecha de Fin</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={proyecto.fechaFin}
                                    onChange={(e) => setProyecto({ ...proyecto, fechaFin: e.target.value })}
                                />
                            </div>
                            <div className="mb-3">
                                <label>Estado</label>
                                <select
                                    className="form-control"
                                    value={proyecto.status}
                                    onChange={(e) => setProyecto({ ...proyecto, status: e.target.value })}
                                >
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="En Proceso">En Proceso</option>
                                    <option value="Completado">Completado</option>
                                </select>
                            </div>

                            {/* Tabla de tareas */}
                            <h4>Tareas</h4>
                            <button
                                className="btn btn-success mb-3"
                                onClick={() => navigate(`/proyectos/${id}/agregar-tarea`)}
                            >
                                Agregar Tarea
                            </button>
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>Título</th>
                                        <th>Descripción</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tareas.map((tarea) => (
                                        <tr key={tarea._id}>
                                            <td>{tarea.title}</td>
                                            <td>{tarea.description}</td>
                                            <td>{tarea.status}</td>
                                            <td>
                                                <button className="btn btn-warning me-2" onClick={() => handleEdit(tarea, true)}>
                                                    Editar
                                                </button>
                                                <button className="btn btn-danger" onClick={() => handleDelete(tarea, true)}>
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Tabla de gastos */}
                            <h4>Gastos</h4>
                            <button
                                className="btn btn-success mb-3"
                                onClick={() => navigate(`/proyectos/${id}/agregar-gasto`)}
                            >
                                Agregar Gasto
                            </button>
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>Categoría</th>
                                        <th>Descripción</th>
                                        <th>Monto</th>
                                        <th>Realizado por</th>
                                        <th>Fecha</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {gastos.map((gasto) => (
                                        <tr key={gasto._id}>
                                            <td>{gasto.category}</td>
                                            <td>{gasto.description}</td>
                                            <td>{gasto.amount}</td>
                                            <td>{gasto.doneBy}</td>
                                            <td>{new Date(gasto.date).toLocaleDateString()}</td>
                                            <td>
                                                <button className="btn btn-warning me-2" onClick={() => handleEdit(gasto, false)}>
                                                    Editar
                                                </button>
                                                <button className="btn btn-danger" onClick={() => handleDelete(gasto, false)}>
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Modal de confirmación de eliminación */}
                            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Confirmar Eliminación</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    ¿Está seguro de que desea eliminar este{' '}
                                    {isDeletingTask ? 'tarea' : 'gasto'}?
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
                            <div className="mb-4 d-flex justify-content-between">
                                <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                                <button className="btn btn-outline-dark mb-3" onClick={() => navigate('/proyectos')}>Regresar</button>
                            </div>
                        </form>

                    </>
                )}
            </div>
        </div>
    );
};

export default EditarProyecto;
