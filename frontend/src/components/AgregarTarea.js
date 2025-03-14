// frontend/src/components/AgregarTarea.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
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
        dependencias: []
    });
    const [projectData, setProjectData] = useState({ name: '', start: '', end: '' }); // Datos del proyecto
    const [tareas, setTareas] = useState([]); // Tareas existentes
    const [message, setMessage] = useState('');

    // Obtener los datos del proyecto y las tareas al cargar la página
    useEffect(() => {
        const fetchProjectData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get(`http://localhost:5000/api/projects/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const { nombreProyecto, fechaInicio, fechaFin } = response.data;
                setProjectData({ name: nombreProyecto, start: fechaInicio, end: fechaFin });

                // Cargar tareas asociadas al proyecto (excluyendo tareas completadas)
                const tareasResponse = await axios.get(`http://localhost:5000/api/tasks/proyecto/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTareas(tareasResponse.data.filter(tarea => tarea.status !== 'Completado'));
            } catch (error) {
                console.error('Error al obtener los datos del proyecto:', error);
                setMessage('Error al cargar los datos del proyecto.');
            }
        };

        fetchProjectData();
    }, [id]);

    const handleCheckboxChange = (taskId) => {
        if (tarea.dependencias.includes(taskId)) {
            setTarea({ ...tarea, dependencias: tarea.dependencias.filter(dep => dep !== taskId) });
        } else {
            setTarea({ ...tarea, dependencias: [...tarea.dependencias, taskId] });
        }
    };

    const handleAddTarea = async (e) => {
        e.preventDefault();
        setMessage('');

        // Validar fechas en el frontend
        const taskStart = new Date(tarea.startDate);
        const taskEnd = tarea.endDate ? new Date(tarea.endDate) : null;
        const projectStart = new Date(projectData.start);
        const projectEnd = new Date(projectData.end);

        if (taskStart < projectStart || (taskEnd && taskEnd > projectEnd)) {
            setMessage('Las fechas de la tarea deben estar dentro del intervalo del proyecto.');
            return;
        }

        if (taskEnd && taskStart > taskEnd) {
            setMessage('La fecha de inicio debe ser anterior o igual a la fecha de finalización.');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            await axios.post('http://localhost:5000/api/tasks', { ...tarea, project: id }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage('Tarea agregada con éxito');

            // Recargar las tareas después de agregar una
            const tareasResponse = await axios.get(`http://localhost:5000/api/tasks/proyecto/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTareas(tareasResponse.data); // Actualizar las tareas
            setTarea({ title: '', description: '', status: 'Pendiente', startDate: '', endDate: '', dependencias: [] });
        } catch (error) {
            console.error('Error al agregar tarea:', error);
            setMessage('Error al agregar la tarea');
        }
    };

    return (
        <div>
            <div className="container mt-5">
                <h2 className="text-center mb-4">Agregar Tarea al Proyecto: {projectData.name}</h2>
                <p className="text-center">
                    <strong>Fecha de Inicio del Proyecto:</strong> {projectData.start ? new Date(projectData.start).toISOString().split('T')[0] : ''}
                </p>
                <p className="text-center">
                    <strong>Fecha de Finalización del Proyecto:</strong> {projectData.end ? new Date(projectData.end).toISOString().split('T')[0] : ''}
                </p>
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

                    <div className="mb-3">
                        <label>Dependencias</label>
                        <div className="border p-3">
                            {tareas.length > 0 ? (
                                tareas.map(task => (
                                    <div key={task._id} className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={tarea.dependencias.includes(task._id)}
                                            onChange={() => handleCheckboxChange(task._id)}
                                        />
                                        <label className="form-check-label">
                                            {task.title} ({task.status})
                                        </label>
                                    </div>
                                ))
                            ) : (
                                <p>No hay tareas disponibles como dependencias.</p>
                            )}
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary">Agregar Tarea</button>
                </form>

                {/* Tabla de tareas existentes con dependencias */}
                <h3 className="mt-4">Tareas Existentes en el Proyecto</h3>
                <table className="table table-bordered mt-3">
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Descripción</th>
                            <th>Estado</th>
                            <th>Fechas de Inicio y Fin</th>
                            <th>Dependencias</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tareas.map((tarea) => (
                            <tr key={tarea._id}>
                                <td>{tarea.title}</td>
                                <td>{tarea.description}</td>
                                <td>{tarea.status}</td>
                                <td>
                                    {tarea.startDate ? new Date(tarea.startDate).toISOString().split('T')[0] : ''}
                                     --- 
                                    {tarea.endDate ? new Date(tarea.endDate).toISOString().split('T')[0] : 'No definida'}
                                </td>
                                <td>
                                    {tarea.dependencias && tarea.dependencias.length > 0 ? (
                                        <ul className="list-unstyled mb-0">
                                            {tarea.dependencias.map(dep => (
                                                <li key={dep._id}>{dep.title}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span className="text-muted">Sin dependencias</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button className="btn btn-outline-dark mt-3" onClick={() => navigate(`/proyectos/${id}/editar`)}>
                    Regresar
                </button>
            </div>
        </div>
    );
};

export default AgregarTarea;
