// frontend/src/components/CambiarPasswordAdmin.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from './Navbar';

const CambiarPasswordAdmin = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const { userId } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        // Validar que las contraseñas coincidan
        if (newPassword !== confirmPassword) {
            setMessage('Las contraseñas no coinciden.');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.put(
                `http://localhost:5000/api/users/${userId}/change-password`,
                { newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessage(response.data.message);
            setTimeout(() => navigate('/AdministrarUsuarios'), 2000);
        } catch (error) {
            console.error('Error al cambiar la contraseña:', error);
            setMessage(error.response?.data?.message || 'Error al cambiar la contraseña');
        }
    };

    return (
        <div>
            <Navbar />
            <div className="container mt-5">
                <h2>Cambiar Contraseña del Usuario</h2>
                {message && <div className="alert alert-info">{message}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label>Nueva Contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label>Confirmar Nueva Contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Cambiar Contraseña</button>
                    <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate('/AdministrarUsuarios')}>Cancelar</button>
                </form>
            </div>
        </div>
    );
};

export default CambiarPasswordAdmin;
