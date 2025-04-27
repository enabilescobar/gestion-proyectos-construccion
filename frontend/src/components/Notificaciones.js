import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Table, Button, Badge } from 'react-bootstrap';
import { CheckCircle, FolderKanban, StickyNote, Trash } from 'lucide-react';
import moment from 'moment';
import 'moment/locale/es';
import { useNavigate } from 'react-router-dom';

const Notificaciones = () => {
    const [notificaciones, setNotificaciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [paginaActual, setPaginaActual] = useState(1);
    const [notificacionesPorPagina, setNotificacionesPorPagina] = useState(10);
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');

    const fetchNotificaciones = async () => {
        setCargando(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await axios.get('http://localhost:5000/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotificaciones(res.data);
        } catch (error) {
            console.error('Error al obtener notificaciones:', error);
        } finally {
            setCargando(false);
        }
    };
    
    const generarYFetchNotificaciones = async () => {
        try {
          const token = localStorage.getItem('authToken');
      
          // Primero generar nuevas notificaciones si hay retrasos
          await axios.get('http://localhost:5000/api/notifications/generar', {
            headers: { Authorization: `Bearer ${token}` }
          });
      
          // Luego refrescar la lista actualizada
          await fetchNotificaciones();
        } catch (error) {
          console.error('Error al generar o actualizar notificaciones:', error);
          alert('Ocurrió un error al intentar actualizar las notificaciones.');
        }
      };
      
    const marcarComoLeida = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.put(`http://localhost:5000/api/notifications/${id}/leida`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotificaciones((prev) =>
                prev.map((n) =>
                    n._id === id ? { ...n, leida: true } : n
                )
            );
        } catch (error) {
            console.error('Error al marcar como leída:', error);
        }
    };

    const handleEliminarAtendidas = async () => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar todas las notificaciones atendidas?')) return;
        try {
          const token = localStorage.getItem('authToken');
          const res = await axios.delete('http://localhost:5000/api/notifications/atendidas', {
            headers: { Authorization: `Bearer ${token}` }
          });
          alert(res.data.message);
          fetchNotificaciones(); // Recargar notificaciones
        } catch (error) {
          console.error('Error al eliminar notificaciones atendidas:', error);
          alert('Ocurrió un error al intentar eliminar las notificaciones.');
        }
      };

    const eliminarNotificacion = async (id) => {
        if (!window.confirm('¿Deseas eliminar esta notificación?')) return;
        try {
            const token = localStorage.getItem('authToken');
            await axios.delete(`http://localhost:5000/api/notifications/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
            });
            // Eliminar del estado local
            setNotificaciones(prev => prev.filter(n => n._id !== id));
        } catch (error) {
            console.error('Error al eliminar notificación:', error);
            alert('Error al eliminar la notificación.');
        }
    };
      
    useEffect(() => {
        fetchNotificaciones();
    }, []);

    useEffect(() => {
        const intervalo = setInterval(() => {
          fetchNotificaciones();
        }, 60000); // cada 60 segundos
      
        return () => clearInterval(intervalo); // limpieza
      }, []);
      
    const indiceUltimo = paginaActual * notificacionesPorPagina;
    const indicePrimero = indiceUltimo - notificacionesPorPagina;
    const notificacionesFiltradas = notificaciones.filter(n => {
        const coincideTipo = filtroTipo === '' || n.tipo === filtroTipo;
        const coincideEstado =
            filtroEstado === '' ||
            (filtroEstado === 'pendiente' && !n.leida) ||
            (filtroEstado === 'atendida' && n.leida);
        return coincideTipo && coincideEstado;
    });
        const notificacionesPaginadas = notificacionesFiltradas.slice(indicePrimero, indiceUltimo);
    const totalPaginas = Math.ceil(notificacionesFiltradas.length / notificacionesPorPagina);
        
    const cambiarPagina = (pagina) => {
        if (pagina > 0 && pagina <= totalPaginas) {
            setPaginaActual(pagina);
        }
    };
    
    const agruparPorFecha = (lista) => {
        const hoy = moment();
        const ayer = moment().subtract(1, 'day');
      
        return {
          hoy: lista.filter(n => moment(n.fecha).isSame(hoy, 'day')),
          ayer: lista.filter(n => moment(n.fecha).isSame(ayer, 'day')),
          otras: lista.filter(n =>
            !moment(n.fecha).isSame(hoy, 'day') &&
            !moment(n.fecha).isSame(ayer, 'day')
          )
        };
      };
      
    const agrupadas = agruparPorFecha(notificacionesPaginadas);

    const navigate = useNavigate(); // Lo inicializamos

    const handleRowClick = async (n) => {
        if (!n) return;
      
        if (n.tipo === 'Project') {
          navigate(`/proyectos/${n.referenciaId?._id || n.referenciaId}`);
        } else if (n.tipo === 'Task') {
          try {
            const token = localStorage.getItem('authToken');
            const res = await axios.get(`http://localhost:5000/api/tasks/${n.referenciaId._id}/project`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const projectId = res.data.projectId;
            if (projectId) {
              navigate(`/proyectos/${projectId}`);
            } else {
              alert('Proyecto no encontrado para esta tarea.');
            }
          } catch (error) {
            console.error('Error obteniendo proyecto:', error);
            alert('Error obteniendo el proyecto de la tarea.');
          }
        }
      };
      
    return (
        <Container className="mt-4">
            <h3 className="mb-4">Notificaciones</h3>

            {cargando ? (
                <p>Cargando notificaciones...</p>
            ) : notificaciones.length === 0 ? (
                <p className="text-muted">No hay notificaciones disponibles.</p>
            ) : (
                <div className="table-responsive">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <label className="me-2">Mostrar:</label>
                            <select
                                className="form-select d-inline-block w-auto me-3"
                                value={notificacionesPorPagina}
                                onChange={(e) => {
                                    setNotificacionesPorPagina(Number(e.target.value));
                                    setPaginaActual(1);
                                }}
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={100}>100</option>
                            </select>

                            <label className="me-2">Filtrar por tipo:</label>
                            <select
                                className="form-select d-inline-block w-auto"
                                value={filtroTipo}
                                onChange={(e) => {
                                    setFiltroTipo(e.target.value);
                                    setPaginaActual(1);
                                }}
                            >
                                <option value="">Todas</option>
                                <option value="Project">Proyectos</option>
                                <option value="Task">Tareas</option>
                            </select>

                            <label className="me-2">Estado:</label>
                            <select
                                className="form-select d-inline-block w-auto"
                                value={filtroEstado}
                                onChange={(e) => {
                                    setFiltroEstado(e.target.value);
                                    setPaginaActual(1);
                                }}
                            >
                                <option value="">Todas</option>
                                <option value="pendiente">Pendientes</option>
                                <option value="atendida">Atendidas</option>
                            </select>

                            <Button
                                variant="outline-primary"
                                onClick={generarYFetchNotificaciones}
                                className="ms-3"
                            >
                                Actualizar
                            </Button>

                            <Button
                                variant="danger"
                                className="ms-3"
                                onClick={handleEliminarAtendidas}
                            >
                                Eliminar atendidas
                            </Button>

                        </div>
                    </div>

                    <Table striped bordered hover className="align-middle text-center shadow-sm">
                    <thead className="table-dark">
                        <tr>
                        <th>Tipo</th>
                        <th>Mensaje</th>
                        <th>Inicio</th>
                        <th>Alerta</th>
                        <th>Estado</th>
                        <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Hoy */}
                        {agrupadas.hoy.length > 0 && (
                        <>
                            <tr>
                            <td colSpan="6" className="bg-primary text-white fw-bold">Hoy</td> {/* colSpan ajustado */}
                            </tr>
                            {agrupadas.hoy.map((n) => (
                                <tr
                                key={n._id}
                                className={!n.leida ? 'table-info fw-bold' : ''}
                                onClick={() => handleRowClick(n)}
                                style={{ cursor: 'pointer' }}
                                >
                                <td>{n.tipo === 'Project' ? <FolderKanban size={18} /> : <StickyNote size={18} />}</td>
                                <td>{n.mensaje}</td>
                                <td>
                                {moment(
                                    n.referenciaId?.fechaInicio || n.referenciaId?.startDate
                                ).format('DD/MM/YYYY')}
                                </td>
                                <td>{moment(n.fecha).format('DD/MM/YYYY HH:mm')}</td>
                                <td>{n.leida ? <Badge bg="secondary">Atendida</Badge> : <Badge bg="warning">Pendiente</Badge>}</td>
                                <td>
                                {!n.leida ? (
                                    <Button
                                    variant="success"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        marcarComoLeida(n._id);
                                    }}
                                    >
                                    <CheckCircle size={16} className="me-1" />
                                    Atender
                                    </Button>
                                ) : (
                                    <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        eliminarNotificacion(n._id);
                                    }}
                                    >
                                    <Trash size={16} className="me-1" />
                                    Eliminar
                                    </Button>
                                )}
                                </td>
                            </tr>
                            ))}
                        </>
                        )}

                        {/* Ayer */}
                        {agrupadas.ayer.length > 0 && (
                        <>
                            <tr>
                            <td colSpan="6" className="bg-secondary text-white fw-bold">Ayer</td>
                            </tr>
                            {agrupadas.ayer.map((n) => (
                                <tr
                                key={n._id}
                                className={!n.leida ? 'table-info fw-bold' : ''}
                                onClick={() => handleRowClick(n)}
                                style={{ cursor: 'pointer' }}
                                >
                                <td>{n.tipo === 'Project' ? <FolderKanban size={18} /> : <StickyNote size={18} />}</td>
                                <td>{n.mensaje}</td>
                                <td>
                                {moment(
                                    n.referenciaId?.fechaInicio || n.referenciaId?.startDate
                                ).format('DD/MM/YYYY')}
                                </td>
                                <td>{moment(n.fecha).format('DD/MM/YYYY HH:mm')}</td>
                                <td>{n.leida ? <Badge bg="secondary">Atendida</Badge> : <Badge bg="warning">Pendiente</Badge>}</td>
                                <td>
                                {!n.leida ? (
                                    <Button
                                    variant="success"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        marcarComoLeida(n._id);
                                    }}
                                    >
                                    <CheckCircle size={16} className="me-1" />
                                    Atender
                                    </Button>
                                ) : (
                                    <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        eliminarNotificacion(n._id);
                                    }}
                                    >
                                    <Trash size={16} className="me-1" />
                                    Eliminar
                                    </Button>
                                )}
                                </td>
                            </tr>
                            ))}
                        </>
                        )}

                        {/* Anteriores */}
                        {agrupadas.otras.length > 0 && (
                        <>
                            <tr>
                            <td colSpan="6" className="bg-light fw-bold">Anteriores</td>
                            </tr>
                            {agrupadas.otras.map((n) => (
                                <tr
                                key={n._id}
                                className={!n.leida ? 'table-info fw-bold' : ''}
                                onClick={() => handleRowClick(n)}
                                style={{ cursor: 'pointer' }}
                                >
                                <td>{n.tipo === 'Project' ? <FolderKanban size={18} /> : <StickyNote size={18} />}</td>
                                <td>{n.mensaje}</td>
                                <td>
                                {moment(
                                    n.referenciaId?.fechaInicio || n.referenciaId?.startDate
                                ).format('DD/MM/YYYY')}
                                </td>
                                <td>{moment(n.fecha).format('DD/MM/YYYY HH:mm')}</td>
                                <td>{n.leida ? <Badge bg="secondary">Atendida</Badge> : <Badge bg="warning">Pendiente</Badge>}</td>
                                <td>
                                {!n.leida ? (
                                    <Button
                                    variant="success"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        marcarComoLeida(n._id);
                                    }}
                                    >
                                    <CheckCircle size={16} className="me-1" />
                                    Atender
                                    </Button>
                                ) : (
                                    <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        eliminarNotificacion(n._id);
                                    }}
                                    >
                                    <Trash size={16} className="me-1" />
                                    Eliminar
                                    </Button>

)}
                                </td>
                            </tr>
                            ))}
                        </>
                        )}
                    </tbody>
                    </Table>
                    {totalPaginas > 1 && (
                        <div className="d-flex justify-content-center mt-4">
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
            )}
        </Container>
    );
};

export default Notificaciones;
