// frontend/src/components/RegistrarGasto.js
import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';

const RegistrarGasto = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const [gasto, setGasto] = useState({
        category: 'Materiales',
        description: '',
        amount: '',
        doneBy: '',
        date: '',
    });
    const [message, setMessage] = useState('');

    const handleAddGasto = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('authToken');
            await axios.post('http://localhost:5000/api/gastos', { ...gasto, project: id }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage('Gasto registrado con éxito');
            setTimeout(() => navigate(`/proyectos/${id}/editar`), 2000);
        } catch (error) {
            console.error('Error al registrar el gasto:', error);
            setMessage('Error al registrar el gasto');
        }
    };

    return (
        <div>
            <Navbar />
            <div className="container mt-5">
                <button className="btn btn-outline-dark mb-3" onClick={() => navigate(`/proyectos/${id}/editar`)}>
                    Regresar
                </button>
                <h2 className="text-center mb-4">Registrar Gasto</h2>
                {message && <div className="alert alert-info">{message}</div>}
                <form onSubmit={handleAddGasto}>
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
                    <button type="submit" className="btn btn-primary">Registrar Gasto</button>
                </form>
            </div>
        </div>
    );
};

export default RegistrarGasto;
