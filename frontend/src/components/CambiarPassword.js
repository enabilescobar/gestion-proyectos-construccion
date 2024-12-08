// frontend/src/components/CambiarPassword.js
import React, { useState } from 'react';
import axios from 'axios';

const CambiarPassword = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.put('http://localhost:5000/api/users/change-password', 
            { currentPassword, newPassword }, 
            { headers: { Authorization: `Bearer ${token}` } });

            setMessage(response.data.message);
        } catch (error) {
            console.error('Error al cambiar la contraseña:', error);
            setMessage(error.response?.data?.message || 'Error al cambiar la contraseña');
        }
    };

    return (
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
                <button type="submit" className="btn btn-primary">Cambiar Contraseña</button>
            </form>
        </div>
    );
};

export default CambiarPassword;
