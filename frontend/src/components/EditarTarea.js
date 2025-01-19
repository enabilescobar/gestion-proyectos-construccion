// frontend/src/components/EditarTarea.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
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
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchTarea();
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
            });
        } catch (error) {
            console.error('Error al obtener la tarea:', error);
            setMessage('Error al cargar los datos de la tarea');
        }
    };

    const handleEditTarea = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('authToken');
            
            // Actualizar la tarea
            await axios.put(`http://localhost:5000/api/tasks/${taskId}`, tarea, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Llamar a la API para recalcular el avance del proyecto después de actualizar la tarea
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
        <div>
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
                            onChange={(e) => setTarea({ ...tarea, status: e.target.value })}
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
                    <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                </form>
            </div>
        </div>
    );
};

export default EditarTarea;
