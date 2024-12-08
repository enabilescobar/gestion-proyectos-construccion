// frontend/src/components/CrearUsuario.js
import React, { useState } from 'react';
import Navbar from './Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const CrearUsuario = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user',
        isActive: true,
    });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');

        if (!token) {
            setMessage('No se encontró un token válido. Por favor, inicia sesión nuevamente.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setMessage('Las contraseñas no coinciden.');
            return;
        }

        try {
            const newUser = { ...formData };
            delete newUser.confirmPassword;
            await axios.post('http://localhost:5000/api/users/register', newUser, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage('Usuario creado con éxito.');
            setTimeout(() => navigate('/AdministrarUsuarios'), 2000);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setMessage(error.response.data.message || 'Datos inválidos.');
            } else {
                console.error('Error al crear el usuario:', error);
                setMessage('Error al crear el usuario.');
            }
        }
    };

    return (
        <div>
            <Navbar />
            <div className="container mt-5">
                <h2 className="mb-4">Crear Usuario</h2>
                {message && <div className="alert alert-info">{message}</div>}
                <form onSubmit={handleFormSubmit}>
                    <div className="mb-3">
                        <label>Nombre</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label>Email</label>
                        <input
                            type="email"
                            className="form-control"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label>Confirmar Contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label>Rol</label>
                        <select
                            className="form-control"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="user">Usuario</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        <label className="ms-2">Activo</label>
                    </div>
                    <div className="d-flex justify-content-between">
                        <button type="submit" className="btn btn-primary">
                            Guardar
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/AdministrarUsuarios')}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CrearUsuario;
