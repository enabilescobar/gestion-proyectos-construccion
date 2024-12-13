// frontend/src/components/AddProject.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const AddProject = () => {
    const [nombreProyecto, setNombreProyecto] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        // Validación en el frontend: Fecha de inicio debe ser anterior a la fecha de fin
        if (fechaFin && new Date(fechaInicio) >= new Date(fechaFin)) {
            setMessage('La fecha de inicio debe ser anterior a la fecha de fin.');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setMessage('No se encontró un token válido. Por favor, inicia sesión nuevamente.');
                return;
            }

            if (!nombreProyecto || !fechaInicio) {
                setMessage('El nombre del proyecto y la fecha de inicio son obligatorios.');
                return;
            }

            const newProject = { nombreProyecto, descripcion, fechaInicio, fechaFin };
            const response = await axios.post('http://localhost:5000/api/projects', newProject, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setMessage('Proyecto creado con éxito');
            console.log('Proyecto creado:', response.data);
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
                <div className="mb-3">
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
                <div className="mb-3">
                    <label htmlFor="fechaFin" className="form-label">Fecha de Fin</label>
                    <input
                        type="date"
                        className="form-control"
                        id="fechaFin"
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                    />
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
