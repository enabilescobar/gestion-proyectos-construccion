import React, { useState } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';

const AgregarFactura = ({ gastoId, proyectoId }) => {
    const [archivo, setArchivo] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [facturas, setFacturas] = useState([]); // Para mostrar los archivos ya subidos

    // Manejar archivo seleccionado
    const manejarArchivo = (e) => {
        setArchivo(e.target.files[0]);
    };

    // Subir archivo
    const subirArchivo = async (e) => {
        e.preventDefault();

        if (!archivo) {
            setMensaje('Por favor, selecciona un archivo');
            return;
        }

        const formData = new FormData();
        formData.append('archivo', archivo);
        formData.append('gastoId', gastoId);
        formData.append('proyectoId', proyectoId);

        try {
            const response = await axios.post('http://localhost:5000/api/gastos/subir-factura', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setFacturas(prevFacturas => [...prevFacturas, response.data.factura]);
            setShowModal(false);
            setMensaje('Factura subida correctamente');
        } catch (error) {
            setMensaje(error.response?.data?.message || 'Error al subir la factura');
        }
    };

    // Eliminar factura
    const eliminarFactura = async (facturaId) => {
        try {
            await axios.delete(`http://localhost:5000/api/gastos/eliminar-factura/${facturaId}`);
            setFacturas(facturas.filter(f => f._id !== facturaId));
        } catch (error) {
            setMensaje(error.response?.data?.message || 'Error al eliminar la factura');
        }
    };

    return (
        <div>
            <button className="btn btn-info" onClick={() => setShowModal(true)}>Adjuntar Factura</button>

            {/* Modal para cargar archivo */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Subir Factura</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={subirArchivo}>
                        <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={manejarArchivo}
                        />
                        <button type="submit" className="btn btn-primary mt-3">Subir</button>
                    </form>
                    {mensaje && <p className="mt-2 text-info">{mensaje}</p>}
                </Modal.Body>
            </Modal>

            {/* Mostrar facturas adjuntas */}
            <h5 className="mt-3">Facturas Adjuntas:</h5>
            <ul>
                {facturas.map(factura => (
                    <li key={factura._id}>
                        <a
                            href={`http://localhost:5000${factura.ruta}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {factura.nombre}
                        </a>
                        <button onClick={() => eliminarFactura(factura._id)} className="btn btn-danger btn-sm ms-3">Eliminar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AgregarFactura;
