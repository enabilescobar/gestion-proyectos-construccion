// frontend/src/components/EditarGasto.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const EditarGasto = () => {
    const { id, gastoId } = useParams();
    const navigate = useNavigate();
    const [gasto, setGasto] = useState({
        category: 'Materiales',
        description: '',
        amount: '',
        doneBy: '',
        date: '',
    });
    const [facturas, setFacturas] = useState([]); // Archivos nuevos
    const [existingFacturas, setExistingFacturas] = useState([]); // Facturas existentes
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchGasto();
    }, []);

    const fetchGasto = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`http://localhost:5000/api/gastos/${gastoId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const gastoData = response.data;
            setGasto({
                ...gastoData,
                date: gastoData.date ? gastoData.date.split('T')[0] : '',
            });
            setExistingFacturas(gastoData.facturas || []);
        } catch (error) {
            console.error('Error al obtener el gasto:', error);
            setMessage('Error al cargar los datos del gasto');
        }
    };

    const handleFileChange = (e) => {
        setFacturas(e.target.files); // Actualizamos los archivos seleccionados
    };

    const handleEditGasto = async (e) => {
        e.preventDefault();
        const formData = new FormData(); // Usamos FormData para manejar archivos

        // Agregar datos del gasto al FormData
        formData.append('description', gasto.description);
        formData.append('amount', gasto.amount);
        formData.append('category', gasto.category);
        formData.append('date', gasto.date);
        formData.append('doneBy', gasto.doneBy);
        formData.append('project', id); // Agregar el ID del proyecto

        // Agregar archivos nuevos al FormData
        for (let i = 0; i < facturas.length; i++) {
            formData.append('facturas', facturas[i]);
        }

        try {
            const token = localStorage.getItem('authToken');
            await axios.put(`http://localhost:5000/api/gastos/${gastoId}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage('Gasto actualizado con éxito');
            setTimeout(() => navigate(`/proyectos/${id}/editar`), 2000);
        } catch (error) {
            console.error('Error al actualizar el gasto:', error);
            setMessage('Error al actualizar el gasto');
        }
    };

    const handleDeleteFactura = async (facturaId) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.delete(`http://localhost:5000/api/gastos/${gastoId}/facturas/${facturaId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            if (response.status === 200) {
                setExistingFacturas(existingFacturas.filter((factura) => factura._id !== facturaId));
                setMessage('Factura eliminada con éxito');
            } else {
                setMessage(`Error inesperado: ${response.data.message || 'No se pudo eliminar la factura'}`);
            }
        } catch (error) {
            console.error('Error al eliminar la factura:', error.response?.data || error.message);
            setMessage(`Error al eliminar la factura: ${error.response?.data?.message || error.message}`);
        }
    };
        
    return (
        <div>
            <div className="container mt-5">
                <button className="btn btn-outline-dark mb-3" onClick={() => navigate(`/proyectos/${id}/editar`)}>
                    Regresar
                </button>
                <h2 className="text-center mb-4">Editar Gasto</h2>
                {message && <div className="alert alert-info">{message}</div>}
                <form onSubmit={handleEditGasto} encType="multipart/form-data">
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
                    <div className="mb-3">
                        <h5>Facturas Existentes:</h5>
                        {existingFacturas.length > 0 ? (
                            <ul className="list-group">
                                {existingFacturas.map((factura) => (
                                    <li key={factura._id} className="list-group-item d-flex justify-content-between align-items-center">
                                        {factura.nombre}
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDeleteFactura(factura._id)}
                                        >
                                            Eliminar
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No hay facturas adjuntas.</p>
                        )}
                    </div>
                    <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                </form>
            </div>
        </div>
    );
};

//falta implementar mensaje de error por tipo de archivo y cuando llega al limite de 5 archivos, tambien limpiar la casilla del archivo al agregar exitosamente un archivo, tambien un listado de archivos agregados, pendiente

export default EditarGasto;
