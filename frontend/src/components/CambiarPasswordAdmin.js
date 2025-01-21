import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import 'bootstrap/dist/css/bootstrap.min.css';

const CambiarPasswordAdmin = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newPassword === confirmPassword) {
            setMessage('Contraseña cambiada correctamente.');
        } else {
            setMessage('Las contraseñas no coinciden.');
        }
    };

    return (
        <div>
            <div className="container mt-4">
                <h2 className="text-center mb-4">Cambiar Contraseña</h2>
                {message && <div className="alert alert-info">{message}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label for="newPassword">Nueva Contraseña</label>
                        <input
                            type="password"
                            id="newPassword"
                            className="form-control"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group mt-3">
                        <label for="confirmPassword">Confirmar Contraseña</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="form-control"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="d-flex justify-content-between mt-4">
                        <button type="submit" className="btn btn-primary">Cambiar Contraseña</button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate('/home')}
                        >
                            Regresar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CambiarPasswordAdmin;
