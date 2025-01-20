import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const EditarTarea = () => {
    const { id, taskId } = useParams();
    const navigate = useNavigate();
    const [tarea, setTarea] = useState({
        title: '',
        description: '',
        status: 'Pendiente',
        startDate: '',
        endDate: '',
        dependencias: []
    });
    const [message, setMessage] = useState('');
    const [tareasDisponibles, setTareasDisponibles] = useState([]);
    const [showDependencyModal, setShowDependencyModal] = useState(false);
    const [pendingDependencies, setPendingDependencies] = useState([]);

    useEffect(() => {
        fetchTarea();
        fetchTareasDisponibles();
    }, []);

    const fetchTarea = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`http://localhost:5000/api/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const tareaData = response.data;
            setTarea({
                ...tareaData,
                startDate: tareaData.startDate ? tareaData.startDate.split('T')[0] : '',
                endDate: tareaData.endDate ? tareaData.endDate.split('T')[0] : '',
                dependencias: tareaData.dependencias.map(dep => dep._id),
            });
        } catch (error) {
            console.error('Error al obtener la tarea:', error);
            setMessage('Error al cargar los datos de la tarea');
        }
    };

    const fetchTareasDisponibles = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`http://localhost:5000/api/tasks/proyecto/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTareasDisponibles(response.data.filter(task => task._id !== taskId));
        } catch (error) {
            console.error('Error al obtener las tareas disponibles:', error);
        }
    };

    const handleCheckboxChange = (taskId) => {
        if (tarea.dependencias.includes(taskId)) {
            setTarea({ ...tarea, dependencias: tarea.dependencias.filter(dep => dep !== taskId) });
        } else {
            setTarea({ ...tarea, dependencias: [...tarea.dependencias, taskId] });
        }
    };

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        if (newStatus === 'Completado' && tarea.dependencias.length > 0) {
            const pendientes = tareasDisponibles.filter(task =>
                tarea.dependencias.includes(task._id) && task.status !== 'Completado'
            );

            if (pendientes.length > 0) {
                setPendingDependencies(pendientes);
                setShowDependencyModal(true);
                return;
            }
        }
        setTarea({ ...tarea, status: newStatus });
    };

    const handleEditTarea = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('authToken');

            await axios.put(`http://localhost:5000/api/tasks/${taskId}`, tarea, {
                headers: { Authorization: `Bearer ${token}` },
            });

            await axios.put(`http://localhost:5000/api/projects/${id}/avance`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setMessage('Tarea actualizada con éxito');
            setTimeout(() => navigate(`/proyectos/${id}/editar`), 2000);
        } catch (error) {
            console.error('Error al actualizar la tarea:', error);
            setMessage('Error al actualizar la tarea');
        }
    };

    return (
        <div className="container mt-5">
            <button className="btn btn-outline-dark mb-3" onClick={() => navigate(`/proyectos/${id}/editar`)}>
                Regresar
            </button>
            <h2 className="text-center mb-4">Editar Tarea</h2>
            {message && <div className="alert alert-info">{message}</div>}
            <form onSubmit={handleEditTarea}>
                <div className="mb-3">
                    <label>Título</label>
                    <input
                        type="text"
                        className="form-control"
                        value={tarea.title}
                        onChange={(e) => setTarea({ ...tarea, title: e.target.value })}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label>Descripción</label>
                    <textarea
                        className="form-control"
                        value={tarea.description}
                        onChange={(e) => setTarea({ ...tarea, description: e.target.value })}
                        required
                    ></textarea>
                </div>
                <div className="mb-3">
                    <label>Estado</label>
                    <select
                        className="form-control"
                        value={tarea.status}
                        onChange={handleStatusChange}
                    >
                        <option value="Pendiente">Pendiente</option>
                        <option value="En Proceso">En Proceso</option>
                        <option value="Completado">Completado</option>
                        <option value="Suspendido">Suspendido</option>
                        <option value="Cancelado">Cancelado</option>
                    </select>
                </div>
                <div className="mb-3">
                    <label>Fecha de Inicio</label>
                    <input
                        type="date"
                        className="form-control"
                        value={tarea.startDate}
                        onChange={(e) => setTarea({ ...tarea, startDate: e.target.value })}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label>Fecha de Finalización</label>
                    <input
                        type="date"
                        className="form-control"
                        value={tarea.endDate}
                        onChange={(e) => setTarea({ ...tarea, endDate: e.target.value })}
                    />
                </div>
                <div className="mb-3">
                    <label>Dependencias</label>
                    <div className="border p-3">
                        {tareasDisponibles.length > 0 ? (
                            tareasDisponibles.map(task => (
                                <div key={task._id} className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id={task._id}
                                        checked={tarea.dependencias.includes(task._id)}
                                        onChange={() => handleCheckboxChange(task._id)}
                                    />
                                    <label className="form-check-label" htmlFor={task._id}>
                                        {task.title} ({task.status})
                                    </label>
                                </div>
                            ))
                        ) : (
                            <p>No hay tareas disponibles para seleccionar como dependencias.</p>
                        )}
                    </div>
                </div>
                <button type="submit" className="btn btn-primary">Guardar Cambios</button>
            </form>

            {/* Modal para dependencias pendientes */}
            <Modal show={showDependencyModal} onHide={() => setShowDependencyModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>No se puede completar la tarea</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Las siguientes tareas deben completarse primero:</p>
                    <ul>
                        {pendingDependencies.map(dep => (
                            <li key={dep._id}>{dep.title} ({dep.status})</li>
                        ))}
                    </ul>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDependencyModal(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default EditarTarea;
