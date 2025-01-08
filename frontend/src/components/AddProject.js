import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const AddProject = () => {
    const [nombreProyecto, setNombreProyecto] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [presupuesto, setPresupuesto] = useState('');
    const [usuarios, setUsuarios] = useState([]);
    const [encargado, setEncargado] = useState('');
    const [equipoTrabajo, setEquipoTrabajo] = useState([]); // Array de usuarios seleccionados para el equipo de trabajo
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Obtener usuarios con rol "manager" y "user"
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get('http://localhost:5000/api/users', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsuarios(response.data);
        } catch (error) {
            console.error('Error al obtener los usuarios:', error);
            setMessage('Error al cargar los usuarios');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        // Validación: Fecha de inicio debe ser anterior a la fecha de fin
        if (fechaFin && new Date(fechaInicio) >= new Date(fechaFin)) {
            setMessage('La fecha de inicio debe ser anterior a la fecha de fin.');
            return;
        }

        // Validación: El presupuesto y el encargado son obligatorios
        if (!presupuesto || !encargado) {
            setMessage('El presupuesto y el encargado son obligatorios.');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setMessage('No se encontró un token válido. Por favor, inicia sesión nuevamente.');
                return;
            }

            const newProject = { 
                nombreProyecto, 
                descripcion, 
                fechaInicio, 
                fechaFin, 
                presupuesto, 
                encargado, 
                equipoTrabajo 
            };

            // Enviar la solicitud con el token en las cabeceras
            const response = await axios.post('http://localhost:5000/api/projects', newProject, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setMessage('Proyecto creado con éxito');
            setTimeout(() => navigate('/proyectos'), 2000);
        } catch (error) {
            console.error('Error al crear el proyecto:', error);
            const errorMessage = error.response?.data?.message || 'Error al crear el proyecto';
            setMessage(errorMessage);
        }
    };

    const handleCancel = () => {
        navigate('/proyectos-admin');
    };

    const handleAddUser = (userId) => {
        if (!equipoTrabajo.includes(userId)) {
            setEquipoTrabajo([...equipoTrabajo, userId]);
        }
    };

    const handleRemoveUser = (userId) => {
        setEquipoTrabajo(equipoTrabajo.filter(id => id !== userId));
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Agregar Proyecto</h2>
            {message && <div className="alert alert-info">{message}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="nombreProyecto" className="form-label">Nombre del Proyecto</label>
                    <input
                        type="text"
                        className="form-control"
                        id="nombreProyecto"
                        value={nombreProyecto}
                        onChange={(e) => setNombreProyecto(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="descripcion" className="form-label">Descripción</label>
                    <textarea
                        className="form-control"
                        id="descripcion"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        required
                    ></textarea>
                </div>
                <div className="mb-3 row">
                    <div className="col-md-6">
                        <label htmlFor="fechaInicio" className="form-label">Fecha de Inicio</label>
                        <input
                            type="date"
                            className="form-control"
                            id="fechaInicio"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            required
                        />
                    </div>

                    <div className="col-md-6">
                        <label htmlFor="fechaFin" className="form-label">Fecha de Fin</label>
                        <input
                            type="date"
                            className="form-control"
                            id="fechaFin"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <label htmlFor="presupuesto" className="form-label">Presupuesto</label>
                    <input
                        type="number"
                        className="form-control"
                        id="presupuesto"
                        value={presupuesto}
                        onChange={(e) => setPresupuesto(e.target.value)}
                        required
                    />
                </div>

                {/* Campo para el encargado (manager) */}
                <div className="mb-3">
                    <label htmlFor="encargado" className="form-label">Seleccionar Encargado</label>
                    <select
                        className="form-control"
                        id="encargado"
                        value={encargado}
                        onChange={(e) => setEncargado(e.target.value)}
                        required
                    >
                        <option value="">Selecciona un Encargado (Manager)</option>
                        {usuarios.filter(user => user.role === 'manager').map(manager => (
                            <option key={manager._id} value={manager._id}>
                                {manager.username}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Campo para el equipo de trabajo */}
                <div className="mb-3">
                    <label className="form-label">Seleccionar Usuarios (Equipo de trabajo)</label>
                    <select
                        className="form-control mb-2"
                        onChange={(e) => handleAddUser(e.target.value)}
                    >
                        <option value="">Selecciona un Usuario</option>
                        {usuarios.filter(user => user.role === 'user').map(user => (
                            <option key={user._id} value={user._id}>
                                {user.username}
                            </option>
                        ))}
                    </select>
                    {/* Mostrar usuarios seleccionados */}
                    <ul className="list-group">
                        {equipoTrabajo.map(userId => {
                            const user = usuarios.find(u => u._id === userId);
                            return (
                                <li key={userId} className="list-group-item d-flex justify-content-between">
                                    {user.username}
                                    <button
                                        type="button"
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleRemoveUser(userId)}
                                    >
                                        Eliminar
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="d-flex justify-content-between">
                    <button type="submit" className="btn btn-primary">Crear Proyecto</button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleCancel}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProject;
