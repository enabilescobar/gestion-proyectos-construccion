import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Gantt, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { Container, Form, Spinner, Card } from 'react-bootstrap';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Button } from 'react-bootstrap';

const statusColors = {
    'Pendiente': '#FFC107',
    'En Proceso': '#17A2B8',
    'Completado': '#28A745',
    'Suspendido': '#6C757D',
    'Cancelado': '#DC3545'
};

const DiagramaGantt = () => {
    const [proyectos, setProyectos] = useState([]);
    const [proyectoSeleccionado, setProyectoSeleccionado] = useState('');
    const [tareas, setTareas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState(ViewMode.Day);

    const token = localStorage.getItem('authToken');

    const exportToExcel = async () => {
        try {
            const proyecto = proyectos.find(p => p._id === proyectoSeleccionado);
            if (!proyecto) return;
    
            // Crear mapa de IDs a nombres de tareas
            const mapaTareas = {};
            tareas.forEach(t => {
                mapaTareas[t.id] = t.name;
            });
    
            // ----------------------------
            // HOJA 1: Datos del proyecto + lista de tareas
            // ----------------------------
            const encabezado = [
                ['Nombre del Proyecto', proyecto.nombreProyecto],
                ['Fecha de Inicio', new Date(proyecto.fechaInicio).toLocaleDateString()],
                ['Fecha de Fin', new Date(proyecto.fechaFin).toLocaleDateString()],
                ['Encargado', proyecto.encargado?.nombre || 'No disponible'],
                [],
                ['Tareas del Proyecto:']
            ];
    
            const tareasDatos = tareas.map(t => ({
                Título: t.name,
                Estado: t.progress === 100 ? 'Completado' : t.progress === 50 ? 'En Proceso' : 'Pendiente',
                'Fecha de Inicio': t.start.toLocaleDateString(),
                'Fecha de Fin': t.end.toLocaleDateString(),
                'Dependencias': t.dependencies.map(depId => mapaTareas[depId] || depId).join(', ')
            }));
    
            const hoja1 = XLSX.utils.aoa_to_sheet(encabezado);
            XLSX.utils.sheet_add_json(hoja1, tareasDatos, { origin: -1 });
    
            // ----------------------------
            // HOJA 2: Tabla tipo Gantt visual
            // ----------------------------
    
            // 1. Calcular el rango total de fechas del proyecto
            const allDates = tareas.flatMap(t => [t.start, t.end]);
            const minDate = new Date(Math.min(...allDates));
            const maxDate = new Date(Math.max(...allDates));
    
            const diasRango = [];
            const current = new Date(minDate);
            while (current <= maxDate) {
                diasRango.push(new Date(current));
                current.setDate(current.getDate() + 1);
            }
    
            // 2. Construir tabla
            const ganttHeader = ['Tarea', ...diasRango.map(d => d.toLocaleDateString())];
            const ganttRows = tareas.map(t => {
                const row = [t.name];
                diasRango.forEach(d => {
                    const estaDentro =
                        d >= new Date(t.start.setHours(0, 0, 0, 0)) &&
                        d <= new Date(t.end.setHours(23, 59, 59, 999));
                    row.push(estaDentro ? '🟩' : '');
                });
                return row;
            });
    
            const hoja2 = XLSX.utils.aoa_to_sheet([ganttHeader, ...ganttRows]);
    
            // ----------------------------
            // Generar libro
            // ----------------------------
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, hoja1, 'Resumen Proyecto');
            XLSX.utils.book_append_sheet(workbook, hoja2, 'Gantt Visual');
    
            const nombreArchivo = `Gantt_${proyecto.nombreProyecto.replace(/\s+/g, '_')}.xlsx`;
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), nombreArchivo);
        } catch (error) {
            console.error('Error al exportar Excel:', error);
        }
    };
            
    useEffect(() => {
        const fetchProyectos = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/projects', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProyectos(res.data);
            } catch (err) {
                console.error('Error cargando proyectos:', err);
            }
        };
        fetchProyectos();
    }, [token]);

    const fetchTareas = async (projectId) => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/tasks/proyecto/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data;

            const tasks = data.map((t, index) => ({
                id: t._id,
                name: t.title,
                start: dayjs(t.startDate).startOf('day').toDate(),
                end: dayjs(t.endDate).endOf('day').toDate(),
                type: 'task',
                progress: t.status === 'Completado' ? 100 : t.status === 'En Proceso' ? 50 : 0,
                styles: {
                    progressColor: statusColors[t.status] || '#007bff',
                    backgroundColor: statusColors[t.status] || '#007bff'
                },
                dependencies: t.dependencias?.map(d => d._id.toString()) || [],
            }));

            setTareas(tasks);
        } catch (err) {
            console.error('Error cargando tareas:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleProyectoChange = (e) => {
        const id = e.target.value;
        setProyectoSeleccionado(id);
        if (id) fetchTareas(id);
        else setTareas([]);
    };

    return (
        <Container className="mt-4">
            <h2 className="mb-4 text-center">Diagrama de Gantt del Proyecto</h2>

            <Card className="p-3 mb-4 shadow-sm">
                <Form.Group controlId="proyectoSelect">
                    <Form.Label>Seleccione un proyecto</Form.Label>
                    <Form.Select value={proyectoSeleccionado} onChange={handleProyectoChange}>
                        <option value="">-- Seleccione --</option>
                        {proyectos.map((p) => (
                            <option key={p._id} value={p._id}>{p.nombreProyecto}</option>
                        ))}
                    </Form.Select>
                </Form.Group>
                {proyectoSeleccionado && (
                <Button variant="outline-success" className="mt-3" onClick={exportToExcel}>
                    Exportar a Excel
                </Button>
                )}
            </Card>

            {loading && (
                <div className="text-center mt-5">
                    <Spinner animation="border" role="status" />
                </div>
            )}

            {!loading && tareas.length > 0 && (
                <Card className="p-3 shadow-sm">
                    <Form.Group className="mb-3">
                        <Form.Label>Modo de vista</Form.Label>
                        <Form.Select value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                            <option value={ViewMode.Day}>Día</option>
                            <option value={ViewMode.Week}>Semana</option>
                            <option value={ViewMode.Month}>Mes</option>
                        </Form.Select>
                    </Form.Group>

                    <div style={{ overflowX: 'auto' }}>
                        <Gantt
                            tasks={tareas}
                            viewMode={viewMode}
                            locale="es"
                            listCellWidth="200px"
                            columnWidth={viewMode === ViewMode.Day ? 65 : viewMode === ViewMode.Week ? 150 : 300}
                        />
                    </div>
                </Card>
            )}

            {!loading && proyectoSeleccionado && tareas.length === 0 && (
                <div className="text-center text-muted mt-4">
                    No hay tareas registradas para este proyecto.
                </div>
            )}
        </Container>
    );
};

export default DiagramaGantt;
