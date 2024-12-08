// frontend/src/components/AdministrarUsuario.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { Button, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

const AdministrarUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

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

    useEffect(() => {
        fetchUsuarios();
    }, []);

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

    return (
        <div>
            <Navbar />
            <div className="container mt-5">
                <h2 className="mb-4">Administrar Usuarios</h2>
                {message && <div className="alert alert-info">{message}</div>}

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
                                    <Button variant="warning" size="sm">
                                        Editar
                                    </Button>{' '}
                                    <Button variant="danger" size="sm" onClick={() => handleDeleteUser(user)}>
                                        Eliminar
                                    </Button>{' '}
                                    <Button variant="secondary" size="sm">
                                        Cambiar Contraseña
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <Button
                    variant="success"
                    className="mb-3"
                    onClick={() => navigate('/CrearUsuario')}
                >
                    Crear Usuario
                </Button>
                <Button
                    variant="outline-dark"
                    className="mb-3 ms-3"
                    onClick={() => navigate('/home')}
                >
                    Regresar
                </Button>



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
            </div>
        </div>
    );
};

export default AdministrarUsuarios;
