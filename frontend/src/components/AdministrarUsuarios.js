// frontend/src/components/AdministrarUsuarios.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { Button, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; 

const AdministrarUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [userRole, setUserRole] = useState(''); 
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // Función para obtener usuarios
    const fetchUsuarios = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get('http://localhost:5000/api/users', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsuarios(response.data);
        } catch (error) {
            console.error('Error al obtener los usuarios:', error);
            setMessage('Error al obtener los usuarios.');
        }
    };

    // Función para obtener el rol del usuario autenticado
    const fetchUserRole = async () => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUserRole(decodedToken.role);
                if (decodedToken.role === 'user') {
                    setMessage('No tienes permisos para acceder a esta página.');
                    setTimeout(() => navigate('/home'), 3000); // Redirigir al Home después de 3 segundos
                }
            } catch (error) {
                console.error('Error al decodificar el token:', error);
                navigate('/login'); // Redirigir al login si hay error con el token
            }
        } else {
            navigate('/login'); // Redirigir al login si no hay token
        }
    };

    // Llamadas iniciales
    useEffect(() => {
        fetchUsuarios();
        fetchUserRole();
    }, [navigate]);

    const handleDeleteUser = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const confirmDeleteUser = async () => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.delete(`http://localhost:5000/api/users/${selectedUser._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage('Usuario eliminado con éxito.');
            setShowDeleteModal(false);
            fetchUsuarios();
        } catch (error) {
            console.error('Error al eliminar el usuario:', error);
            setMessage('Error al eliminar el usuario.');
        }
    };

    const handleChangePassword = (userId) => {
        navigate(`/CambiarPasswordAdmin/${userId}`);
    };

    return (
        <div>
            <div className="container mt-5">
                {message && <div className="alert alert-info">{message}</div>}
                {!message && (
                    <>
                        <h2 className="mb-4">Administrar Usuarios</h2>

                        {/* Mostrar el botón Crear Usuario solo para admin y manager */}
                        {(userRole === 'admin' || userRole === 'manager') && (
                            <Button
                                variant="success"
                                className="mb-3"
                                onClick={() => navigate('/CrearUsuario')}
                            >
                                Crear Usuario
                            </Button>
                        )}
                        <Button
                            variant="outline-dark"
                            className="mb-3 ms-3"
                            onClick={() => navigate('/home')}
                        >
                            Regresar
                        </Button>

                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Email</th>
                                    <th>Rol</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map((user) => (
                                    <tr key={user._id}>
                                        <td>{user.username}</td>
                                        <td>{user.email}</td>
                                        <td>{user.role}</td>
                                        <td>{user.isActive ? 'Activo' : 'Inactivo'}</td>
                                        <td>
                                            {/* Deshabilitar acciones para usuarios con rol user */}
                                            <Button
                                                variant="warning"
                                                size="sm"
                                                disabled={userRole === 'user'}
                                            >
                                                Editar
                                            </Button>{' '}
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDeleteUser(user)}
                                                disabled={userRole === 'user'}
                                            >
                                                Eliminar
                                            </Button>{' '}
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => handleChangePassword(user._id)}
                                                disabled={userRole === 'user'}
                                            >
                                                Cambiar Contraseña
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Modal de Confirmación para Eliminar */}
                        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                            <Modal.Header closeButton>
                                <Modal.Title>Confirmar Eliminación</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                ¿Está seguro que desea eliminar al usuario "{selectedUser?.username}"?
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                                    Cancelar
                                </Button>
                                <Button variant="danger" onClick={confirmDeleteUser}>
                                    Eliminar
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdministrarUsuarios;
