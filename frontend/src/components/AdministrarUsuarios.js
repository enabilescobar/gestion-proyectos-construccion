// frontend/src/components/AdministrarUsuarios.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Table,
    Button,
    Modal,
    Form,
    Row,
    Col,
    Container,
} from 'react-bootstrap';
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
    const [filtroRol, setFiltroRol] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const navigate = useNavigate();
    const [paginaActual, setPaginaActual] = useState(1);
    const [usuariosPorPagina, setUsuariosPorPagina] = useState(10);
    
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
            setShowMessageModal(true);
        } catch (error) {
            console.error('Error al eliminar el usuario:', error);
            setMessage('Error al eliminar el usuario.');
            setShowDeleteModal(false);
        }
    };

    const closeMessageModal = () => {
        setShowMessageModal(false);
        fetchUsuarios();
    };

    const handleChangePassword = (userId) => {
        navigate(`/CambiarPasswordAdmin/${userId}`);
    };

    const handleRowClick = (userId) => {
        // Este método queda listo para usar cuando se implemente la edición
        // Por ahora, no hace nada
        console.log('Fila clickeada:', userId);
    };

    const usuariosFiltrados = usuarios.filter(
        (u) =>
            (filtroRol === '' || u.role === filtroRol) &&
            (filtroEstado === '' || (filtroEstado === 'Activo' ? u.isActive : !u.isActive))
    );

    const indiceUltimo = paginaActual * usuariosPorPagina;
    const indicePrimero = indiceUltimo - usuariosPorPagina;
    const usuariosPaginados = usuariosFiltrados.slice(indicePrimero, indiceUltimo);
    const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);
    
    const cambiarPagina = (pagina) => {
        if (pagina > 0 && pagina <= totalPaginas) {
            setPaginaActual(pagina);
        }
    };
    
    return (
        <Container className="mt-5">
            <h2 className="mb-4">Administrar Usuarios</h2>

            <Row className="mb-3">
                <Col md={4}>
                    <Form.Group controlId="filtroRol">
                        <Form.Label>Filtrar por Rol</Form.Label>
                        <Form.Select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
                            <option value="">Todos</option>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="user">Usuario</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group controlId="filtroEstado">
                        <Form.Label>Filtrar por Estado</Form.Label>
                        <Form.Select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                            <option value="">Todos</option>
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={4} className="d-flex align-items-end justify-content-end">
                    {(userRole === 'admin' || userRole === 'manager') && (
                        <Button variant="success" onClick={() => navigate('/CrearUsuario')} className="me-2">
                            Crear Usuario
                        </Button>
                    )}
                    <Button variant="outline-dark" onClick={() => navigate('/home')}>
                        Regresar
                    </Button>
                </Col>
            </Row>

            <div className="table-responsive">
            <Row className="mb-3">
                <Col md="auto">
                    <Form.Label>Mostrar:</Form.Label>
                    <Form.Select
                        value={usuariosPorPagina}
                        onChange={(e) => {
                            setUsuariosPorPagina(Number(e.target.value));
                            setPaginaActual(1);
                        }}
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={100}>100</option>
                    </Form.Select>
                </Col>
            </Row>

                <Table striped bordered hover className="align-middle text-center table-striped shadow-sm">
                    <thead className="table-dark">
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
                        {usuariosFiltrados.length > 0 ? (
                            usuariosPaginados.map((user) => (
                                <tr
                                    key={user._id}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleRowClick(user._id)}
                                >
                                    <td>{user.nombre || 'N/A'}</td>
                                    <td>{user.apellido || 'N/A'}</td>
                                    <td>{user.email}</td>
                                    <td>{user.telefono || 'N/A'}</td>
                                    <td>{user.role}</td>
                                    <td>{user.isActive ? 'Activo' : 'Inactivo'}</td>
                                    <td onClick={(e) => e.stopPropagation()}>
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
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center">No hay usuarios para mostrar.</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
                {totalPaginas > 1 && (
                <div className="d-flex justify-content-center my-3">
                    <nav>
                        <ul className="pagination">
                            <li className={`page-item ${paginaActual === 1 && 'disabled'}`}>
                                <button className="page-link" onClick={() => cambiarPagina(paginaActual - 1)}>Anterior</button>
                            </li>
                            {Array.from({ length: totalPaginas }, (_, i) => (
                                <li key={i} className={`page-item ${paginaActual === i + 1 ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => cambiarPagina(i + 1)}>{i + 1}</button>
                                </li>
                            ))}
                            <li className={`page-item ${paginaActual === totalPaginas && 'disabled'}`}>
                                <button className="page-link" onClick={() => cambiarPagina(paginaActual + 1)}>Siguiente</button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}
            </div>

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

            {/* Modal de Mensaje */}
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
        </Container>
    );
};

export default AdministrarUsuarios;
