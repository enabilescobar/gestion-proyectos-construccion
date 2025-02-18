// frontend/src/components/AdministrarUsuarios.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AdministrarUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [userRole, setUserRole] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showMessageModal, setShowMessageModal] = useState(false);
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
                    setTimeout(() => navigate('/home'), 3000);
                }
            } catch (error) {
                console.error('Error al decodificar el token:', error);
                navigate('/login');
            }
        } else {
            navigate('/login');
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
            setMessage(`Usuario "${selectedUser.nombre} ${selectedUser.apellido}" eliminado con éxito.`);
            setShowDeleteModal(false);
            setShowMessageModal(true); // Mostrar modal de confirmación
        } catch (error) {
            console.error('Error al eliminar el usuario:', error);
            setMessage('Error al eliminar el usuario.');
            setShowDeleteModal(false);
        }
    };

    const closeMessageModal = () => {
        setShowMessageModal(false);
        fetchUsuarios(); // Actualizar la lista de usuarios
    };

    const handleChangePassword = (userId) => {
        navigate(`/CambiarPasswordAdmin/${userId}`);
    };

    return (
        <div>
            <div className="container mt-5">
                <h2 className="mb-4">Administrar Usuarios</h2>

                {/* Botones */}
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

                {/* Tabla */}
                <Table striped bordered hover className="table table-bordered">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Correo</th>
                            <th>Teléfono</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map((user) => (
                            <tr key={user._id}>
                                <td>{user.nombre || 'N/A'}</td>
                                <td>{user.apellido || 'N/A'}</td>
                                <td>{user.email}</td>
                                <td>{user.telefono || 'N/A'}</td>
                                <td>{user.role}</td>
                                <td>{user.isActive ? 'Activo' : 'Inactivo'}</td>
                                <td>
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
                </Table>

                {/* Modal de Confirmación para Eliminar */}
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirmar Eliminación</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        ¿Está seguro que desea eliminar al usuario "{selectedUser?.nombre} {selectedUser?.apellido}"?
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

                {/* Modal de Mensaje de Confirmación */}
                <Modal show={showMessageModal} onHide={closeMessageModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Acción Completada</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{message}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={closeMessageModal}>
                            Cerrar
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
};

export default AdministrarUsuarios;
