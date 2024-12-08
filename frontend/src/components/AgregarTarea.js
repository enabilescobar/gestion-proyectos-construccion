// frontend/src/components/AgregarTarea.js
import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';

const AgregarTarea = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tarea, setTarea] = useState({
        title: '',
        description: '',
        status: 'Pendiente',
        startDate: '',
        endDate: '',
    });
    const [message, setMessage] = useState('');

    const handleAddTarea = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('authToken');
            await axios.post('http://localhost:5000/api/tasks', { ...tarea, project: id }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage('Tarea agregada con éxito');
            setTimeout(() => navigate(`/proyectos/${id}/editar`), 2000);
        } catch (error) {
            console.error('Error al agregar tarea:', error);
            setMessage('Error al agregar la tarea');
        }
    };

    return (
        <div>
            <Navbar />
            <div className="container mt-5">
                <button className="btn btn-outline-dark mb-3" onClick={() => navigate(`/proyectos/${id}/editar`)}>
                    Regresar
                </button>
                <h2 className="text-center mb-4">Agregar Tarea</h2>
                {message && <div className="alert alert-info">{message}</div>}
                <form onSubmit={handleAddTarea}>
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
                    <button type="submit" className="btn btn-primary">Agregar Tarea</button>
                </form>
            </div>
        </div>
    );
};

export default AgregarTarea;
