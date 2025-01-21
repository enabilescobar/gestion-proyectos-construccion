// frontend/src/components/CambiarPassword.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CambiarPassword = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        // Validar que las contraseñas coincidan
        if (newPassword !== confirmPassword) {
            setMessage('Las contraseñas nuevas no coinciden.');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.put(
                'http://localhost:5000/api/users/change-password', 
                { currentPassword, newPassword }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessage(response.data.message);

            setTimeout(() => navigate(-1), 2000);
        } catch (error) {
            console.error('Error al cambiar la contraseña:', error);
            setMessage(error.response?.data?.message || 'Error al cambiar la contraseña');
        }
    };

    const handleCancel = () => {
        navigate(-1); 
    };

    return (
        <div>
            <div className="container mt-5">
                <h2>Cambiar Contraseña</h2>
                {message && <div className="alert alert-info">{message}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label>Contraseña Actual</label>
                        <input
                            type="password"
                            className="form-control"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>
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
                    <div className="d-flex justify-content-between">
                        <button type="submit" className="btn btn-primary">Cambiar Contraseña</button>
                        <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CambiarPassword;
