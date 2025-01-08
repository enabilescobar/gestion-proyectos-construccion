// frontend/src/components/RegistrarGasto.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const RegistrarGasto = () => {
    const { id } = useParams(); // Obtiene el ID del proyecto desde la URL
    const navigate = useNavigate();
    const [gasto, setGasto] = useState({
        category: 'Materiales',
        description: '',
        amount: '',
        doneBy: '',
        date: '',
    });
    const [facturas, setFacturas] = useState([]); // Manejo de archivos adjuntos
    const [message, setMessage] = useState('');

    // Manejo de archivos seleccionados
    const handleFileChange = (e) => {
        setFacturas(e.target.files); // Actualiza los archivos seleccionados
    };

    // Función para registrar el gasto
    const handleAddGasto = async (e) => {
        e.preventDefault();

        // Crear un objeto para enviar los datos del gasto
        const formData = new FormData();
        formData.append('description', gasto.description);
        formData.append('amount', gasto.amount);
        formData.append('category', gasto.category);
        formData.append('date', gasto.date);
        formData.append('project', id); // Incluye el ID del proyecto
        formData.append('doneBy', gasto.doneBy);

        // Adjuntar los archivos seleccionados
        for (let i = 0; i < facturas.length; i++) {
            formData.append('facturas', facturas[i]);
        }

        try {
            const token = localStorage.getItem('authToken');
            await axios.post('http://localhost:5000/api/gastos', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage('Gasto registrado con éxito');
            setTimeout(() => navigate(`/proyectos/${id}/editar`), 2000);
        } catch (error) {
            console.error('Error al registrar el gasto:', error.response?.data || error.message);
            setMessage(`Error al registrar el gasto: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <div>
            <div className="container mt-5">
                <button
                    className="btn btn-outline-dark mb-3"
                    onClick={() => navigate(`/proyectos/${id}/editar`)}
                >
                    Regresar
                </button>
                <h2 className="text-center mb-4">Registrar Gasto</h2>
                {message && <div className="alert alert-info">{message}</div>}
                <form onSubmit={handleAddGasto} encType="multipart/form-data">
                    <div className="mb-3">
                        <label>Categoría</label>
                        <select
                            className="form-control"
                            value={gasto.category}
                            onChange={(e) => setGasto({ ...gasto, category: e.target.value })}
                        >
                            <option value="Materiales">Materiales</option>
                            <option value="Herramientas">Herramientas</option>
                            <option value="Combustible">Combustible</option>
                            <option value="Planilla">Planilla</option>
                            <option value="Logística">Logística</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <label>Descripción</label>
                        <textarea
                            className="form-control"
                            value={gasto.description}
                            onChange={(e) => setGasto({ ...gasto, description: e.target.value })}
                            required
                        ></textarea>
                    </div>
                    <div className="mb-3">
                        <label>Monto</label>
                        <input
                            type="number"
                            className="form-control"
                            value={gasto.amount}
                            onChange={(e) => setGasto({ ...gasto, amount: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label>Realizado por</label>
                        <input
                            type="text"
                            className="form-control"
                            value={gasto.doneBy}
                            onChange={(e) => setGasto({ ...gasto, doneBy: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label>Fecha</label>
                        <input
                            type="date"
                            className="form-control"
                            value={gasto.date}
                            onChange={(e) => setGasto({ ...gasto, date: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label>Adjuntar Facturas (opcional)</label>
                        <input
                            type="file"
                            className="form-control"
                            multiple
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleFileChange}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">
                        Registrar Gasto
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegistrarGasto;
