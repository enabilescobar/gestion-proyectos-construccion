import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal, Button, Table, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const EditarProyecto = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [proyecto, setProyecto] = useState({
        nombreProyecto: '',
        descripcion: '',
        fechaInicio: '',
        fechaFin: '',
        status: 'Pendiente',
        presupuesto: '',
        encargado: '',
        equipoTrabajo: [],
        prioridad: 'Media', // Nuevo campo con valor por defecto
        divisa: 'LPS' // Nuevo campo con valor por defecto
    });
    const [tareas, setTareas] = useState([]);
    const [gastos, setGastos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [managers, setManagers] = useState([]);
    const [message, setMessage] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isDeletingTask, setIsDeletingTask] = useState(true);
    const [showFacturasModal, setShowFacturasModal] = useState(false);
    const [facturas, setFacturas] = useState([]);
    const [showDependencyModal, setShowDependencyModal] = useState(false);
    const [dependencyMessage, setDependencyMessage] = useState('');

    useEffect(() => {
        fetchProyecto();
        fetchUsuarios();
    }, []);

    const fetchProyecto = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`http://localhost:5000/api/projects/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const proyectoData = response.data;

            setProyecto({
                ...proyectoData,
                fechaInicio: proyectoData.fechaInicio ? proyectoData.fechaInicio.split('T')[0] : '',
                fechaFin: proyectoData.fechaFin ? proyectoData.fechaFin.split('T')[0] : '',
                encargado: proyectoData.encargado,  // ✅ Guardamos el objeto completo
                equipoTrabajo: proyectoData.equipoTrabajo,  // ✅ Guardamos el array de objetos completos
            });
            
            const tareasResponse = await axios.get(`http://localhost:5000/api/tasks/proyecto/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTareas(tareasResponse.data);

            const gastosResponse = await axios.get(`http://localhost:5000/api/gastos/project/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGastos(gastosResponse.data);
        } catch (error) {
            console.error('Error al obtener los datos del proyecto:', error);
            setMessage('Error al cargar los datos del proyecto');
        }
    };

    const fetchUsuarios = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get('http://localhost:5000/api/users', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const usuariosData = response.data;
            setManagers(usuariosData.filter(user => user.role === 'manager'));
            setUsuarios(usuariosData.filter(user => user.role === 'user'));
        } catch (error) {
            console.error('Error al obtener los usuarios:', error);
            setMessage('Error al cargar los usuarios');
        }
    };

    const handleEditProyecto = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');
        try {
            const updatedProject = { 
                nombreProyecto: proyecto.nombreProyecto,
                descripcion: proyecto.descripcion,
                fechaInicio: proyecto.fechaInicio,
                fechaFin: proyecto.fechaFin,
                presupuesto: proyecto.presupuesto,
                status: proyecto.status,
                encargado: proyecto.encargado,
                equipoTrabajo: proyecto.equipoTrabajo,
                prioridad: proyecto.prioridad, // Se agrega prioridad
                divisa: proyecto.divisa // Se agrega divisa
            };
            
            await axios.put(`http://localhost:5000/api/projects/${id}`, updatedProject, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setMessage('Proyecto actualizado con éxito');
        } catch (error) {
            console.error('Error al actualizar el proyecto:', error);
            setMessage('Error al actualizar el proyecto');
        }
    };

    const handleDelete = (item, isTask) => {
        setSelectedItem(item);
        setIsDeletingTask(isTask);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setMessage('No estás autenticado.');
                return;
            }
            const url = isDeletingTask
                ? `http://localhost:5000/api/tasks/${selectedItem._id}`
                : `http://localhost:5000/api/gastos/${selectedItem._id}`;
    
            await axios.delete(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            setMessage(isDeletingTask ? 'Tarea eliminada con éxito.' : 'Gasto eliminado con éxito.');
            fetchProyecto();
        } catch (error) {
            console.error('Error al eliminar:', error);
            if (error.response && error.response.status === 400 && error.response.data.dependents) {
                setDependencyMessage(
                    `No se puede eliminar esta tarea porque otras tareas dependen de ella: 
                     ${error.response.data.dependents.map(dep => dep.title).join(', ')}`
                );
                setShowDependencyModal(true);
            } else {
                setMessage('Error al eliminar el elemento.');
            }
        } finally {
            setShowDeleteModal(false);
        }
    };

    const handleEdit = (item, isTask) => {
        const path = isTask ? 'editar-tarea' : 'editar-gasto';
        navigate(`/proyectos/${id}/${path}/${item._id}`);
    };

    const handleViewFacturas = (facturas) => {
        setFacturas(facturas);
        setShowFacturasModal(true);
    };

    const handleBack = () => {
        navigate('/proyectos'); // Volver a la lista de proyectos
    };

    return (
        <div>
            <div className="container mt-5">
                <button className="btn btn-outline-dark mb-3" onClick={handleBack}>
                    Regresar
                </button>
                <h2 className="text-center mb-4">Editar Proyecto</h2>
                {message && <div className="alert alert-info">{message}</div>}

                <Card className="shadow-sm p-4 mb-5">
                <h4 className="mb-4 text-center">Información del Proyecto</h4>
                <form onSubmit={handleEditProyecto}>
                    <div className="row">
                    <div className="mb-3 col-md-6">
                        <label>Nombre del Proyecto</label>
                        <input
                        type="text"
                        className="form-control"
                        value={proyecto.nombreProyecto}
                        onChange={(e) => setProyecto({ ...proyecto, nombreProyecto: e.target.value })}
                        required
                        />
                    </div>
                    <div className="mb-3 col-md-6">
                        <label>Presupuesto</label>
                        <input
                        type="number"
                        className="form-control"
                        value={proyecto.presupuesto}
                        onChange={(e) => setProyecto({ ...proyecto, presupuesto: e.target.value })}
                        required
                        />
                    </div>
                    </div>

                    <div className="mb-3">
                    <label>Descripción</label>
                    <textarea
                        className="form-control"
                        value={proyecto.descripcion}
                        onChange={(e) => setProyecto({ ...proyecto, descripcion: e.target.value })}
                        required
                    />
                    </div>

                    <div className="row">
                    <div className="mb-3 col-md-6">
                        <label>Fecha de Inicio</label>
                        <input
                        type="date"
                        className="form-control"
                        value={proyecto.fechaInicio}
                        onChange={(e) => setProyecto({ ...proyecto, fechaInicio: e.target.value })}
                        required
                        />
                    </div>
                    <div className="mb-3 col-md-6">
                        <label>Fecha de Fin</label>
                        <input
                        type="date"
                        className="form-control"
                        value={proyecto.fechaFin}
                        onChange={(e) => setProyecto({ ...proyecto, fechaFin: e.target.value })}
                        />
                    </div>
                    </div>

                    <div className="row">
                    <div className="mb-3 col-md-6">
                        <label>Prioridad</label>
                        <select
                        className="form-control"
                        value={proyecto.prioridad}
                        onChange={(e) => setProyecto({ ...proyecto, prioridad: e.target.value })}
                        required
                        >
                        <option value="Alta">Alta</option>
                        <option value="Media">Media</option>
                        <option value="Baja">Baja</option>
                        </select>
                    </div>

                    <div className="mb-3 col-md-6">
                        <label>Divisa</label>
                        <select
                        className="form-control"
                        value={proyecto.divisa}
                        onChange={(e) => setProyecto({ ...proyecto, divisa: e.target.value })}
                        required
                        >
                        <option value="LPS">Lempiras (LPS)</option>
                        <option value="USD">Dólares (USD)</option>
                        </select>
                    </div>
                    </div>

                    <div className="mb-3">
                    <label>Estado del Proyecto</label>
                    <select
                        className="form-control"
                        value={proyecto.status}
                        onChange={(e) => setProyecto({ ...proyecto, status: e.target.value })}
                    >
                        <option value="Pendiente">Pendiente</option>
                        <option value="En Proceso">En Proceso</option>
                        <option value="Completado">Completado</option>
                        <option value="Suspendido">Suspendido</option>
                        <option value="Cancelado">Cancelado</option>
                    </select>
                    </div>

                    <div className="mb-3">
                    <label>Seleccionar Encargado (Manager)</label>
                    <select
                        className="form-control"
                        value={proyecto.encargado?._id || ''}
                        onChange={(e) => {
                        const selectedManager = managers.find(m => m._id === e.target.value);
                        setProyecto({ ...proyecto, encargado: selectedManager });
                        }}
                        required
                    >
                        <option value="">Selecciona un Encargado</option>
                        {managers.map(manager => (
                        <option key={manager._id} value={manager._id}>
                            {manager.username}
                        </option>
                        ))}
                    </select>
                    </div>

                    <div className="mb-3">
                    <label>Seleccionar Usuarios (Equipo de Trabajo)</label>
                    <select
                        className="form-control mb-2"
                        onChange={(e) => {
                        const selectedUser = usuarios.find(user => user._id === e.target.value);
                        if (selectedUser) {
                            setProyecto({
                            ...proyecto,
                            equipoTrabajo: [...proyecto.equipoTrabajo, selectedUser],
                            });
                        }
                        }}
                    >
                        <option value="">Selecciona un Usuario</option>
                        {usuarios.map(user => (
                        <option key={user._id} value={user._id}>
                            {user.username}
                        </option>
                        ))}
                    </select>
                    <ul className="list-group">
                        {proyecto.equipoTrabajo.map(user => (
                        <li key={user._id} className="list-group-item d-flex justify-content-between align-items-center">
                            {user.username}
                            <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => setProyecto({
                                ...proyecto,
                                equipoTrabajo: proyecto.equipoTrabajo.filter(u => u._id !== user._id),
                            })}
                            >
                            Quitar
                            </button>
                        </li>
                        ))}
                    </ul>
                    </div>

                    <div className="text-center mt-4">
                    <Button type="submit" variant="primary" className="px-5 py-2">
                        Guardar Cambios
                    </Button>
                    </div>
                </form>
                </Card>

                {/* Tareas y Gastos: Mantienen su funcionalidad */}
                <Card className="shadow-sm p-4 mb-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0">Tareas</h4>
                    <Button variant="success" onClick={() => navigate(`/proyectos/${id}/agregar-tarea`)}>
                    Agregar Tarea
                    </Button>
                </div>

                <Table responsive hover borderless className="align-middle">
                    <thead className="table-light">
                    <tr>
                        <th>Título</th>
                        <th>Descripción</th>
                        <th>Estado</th>
                        <th>Dependencias</th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {tareas.map((tarea) => (
                        <tr key={tarea._id}>
                        <td>{tarea.title}</td>
                        <td>{tarea.description}</td>
                        <td>{tarea.status}</td>
                        <td>
                            {tarea.dependencias && tarea.dependencias.length > 0 ? (
                            <ul className="list-unstyled mb-0">
                                {tarea.dependencias.map(dep => (
                                <li key={dep._id}>{dep.title}</li>
                                ))}
                            </ul>
                            ) : (
                            <span className="text-muted">Sin dependencias</span>
                            )}
                        </td>
                        <td>
                            <Button size="sm" variant="warning" className="me-2" onClick={() => handleEdit(tarea, true)}>
                            Editar
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => handleDelete(tarea, true)}>
                            Eliminar
                            </Button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
                </Card>

                <Card className="shadow-sm p-4 mb-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0">Gastos</h4>
                    <Button variant="success" onClick={() => navigate(`/proyectos/${id}/agregar-gasto`)}>
                    Agregar Gasto
                    </Button>
                </div>

                <Table responsive hover borderless className="align-middle">
                    <thead className="table-light">
                    <tr>
                        <th>Categoría</th>
                        <th>Descripción</th>
                        <th>Monto</th>
                        <th>Realizado por</th>
                        <th>Fecha</th>
                        <th>Archivos Adjuntos</th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {gastos.map((gasto) => (
                        <tr key={gasto._id}>
                        <td>{gasto.category}</td>
                        <td>{gasto.description}</td>
                        <td>{gasto.amount}</td>
                        <td>{gasto.doneBy}</td>
                        <td>{gasto.date ? new Date(gasto.date).toISOString().split('T')[0] : ''}</td>
                        <td>
                            {gasto.facturas?.length > 0 ? (
                            <Button variant="link" size="sm" onClick={() => handleViewFacturas(gasto.facturas)}>
                                Ver ({gasto.facturas.length})
                            </Button>
                            ) : (
                            <span className="text-muted">No hay archivos</span>
                            )}
                        </td>
                        <td>
                            <Button size="sm" variant="warning" className="me-2" onClick={() => handleEdit(gasto, false)}>
                            Editar
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => handleDelete(gasto, false)}>
                            Eliminar
                            </Button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
                </Card>

                {/* Modales */}
                <Modal show={showFacturasModal} onHide={() => setShowFacturasModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Archivos Adjuntos</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {facturas.length > 0 ? (
                        facturas.map((factura) => (
                            <div key={factura._id} className="mb-2">
                            <a
                                href={`http://localhost:5000/${factura.ruta}`}
                                download={factura.nombre}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {factura.nombre}
                            </a>
                            </div>
                        ))
                        ) : (
                        <p className="text-muted">No hay archivos disponibles.</p>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowFacturasModal(false)}>
                        Cerrar
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirmar Eliminación</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        ¿Está seguro de que desea eliminar este {isDeletingTask ? 'tarea' : 'gasto'}?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancelar
                        </Button>
                        <Button variant="danger" onClick={confirmDelete}>
                        Eliminar
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Modal para mostrar dependencias*/}
                <Modal show={showDependencyModal} onHide={() => setShowDependencyModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>No se puede eliminar</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {dependencyMessage}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDependencyModal(false)}>
                        Cerrar
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
};

export default EditarProyecto;
