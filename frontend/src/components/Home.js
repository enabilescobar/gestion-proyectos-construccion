import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Registrar los componentes necesarios de Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const localizer = momentLocalizer(moment);
const colorPalette = ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#9966FF'];
const statusColors = {
    "Pendiente": "#FFC107",  // Amarillo
    "En Proceso": "#4CAF50", // Verde
    "Completado": "#2196F3", // Azul
    "Suspendido": "#9E9E9E", // Gris
    "Cancelado": "#F44336"   // Rojo
};


const Home = () => {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState('');
    const [events, setEvents] = useState([]);
    const [avanceProyectos, setAvanceProyectos] = useState([]);
    const [presupuestoProyectos, setPresupuestoProyectos] = useState([]);
    const [statusCounts, setStatusCounts] = useState({
        "Pendiente": 0,
        "En Proceso": 0,
        "Completado": 0,
        "Suspendido": 0,
        "Cancelado": 0
    });
    

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserRole(decoded.role);
            } catch (error) {
                console.error('Error al decodificar el token:', error);
            }
        }

        const fetchProjectData = async () => {
            try {
                if (!token) {
                    console.error('No se encontró el token de autenticación');
                    return;
                }

                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };

                const avanceResponse = await axios.get('http://localhost:5000/api/projects/avance', config);
                setAvanceProyectos(avanceResponse.data || []);

                const presupuestoResponse = await axios.get('http://localhost:5000/api/projects/presupuesto', config);
                setPresupuestoProyectos(presupuestoResponse.data || []);
                const projectsResponse = await axios.get('http://localhost:5000/api/projects', config);
                const projects = projectsResponse.data || [];
                
                // Contar proyectos por estado
                const counts = { "Pendiente": 0, "En Proceso": 0, "Completado": 0, "Suspendido": 0, "Cancelado": 0 };
                projects.forEach(proyecto => {
                    if (proyecto.status in counts) {
                        counts[proyecto.status]++;
                    }
                });
                
                setStatusCounts(counts);

                const fechasResponse = await axios.get('http://localhost:5000/api/projects/fechas', config);
                
                // Procesar fechas para asegurarnos de que se envíen como objetos Date válidos
                const eventosData = fechasResponse.data.map((event, index) => ({
                    id: event.id,
                    title: event.titulo,
                    start: new Date(new Date(event.fechaInicio).setDate(new Date(event.fechaInicio).getDate() + 1)), // Ajuste de un día
                    end: new Date(new Date(event.fechaFin).setDate(new Date(event.fechaFin).getDate() + 1)),
                    projectId: event.id,
                    color: colorPalette[index % colorPalette.length]
                }));
                
                setEvents(eventosData);
            } catch (error) {
                console.error('Error al obtener datos de proyectos:', error);
            }
        };

        fetchProjectData();
    }, []);

    const proyectosEnProceso = avanceProyectos.filter(proyecto =>
        proyecto.status?.trim().toLowerCase() === 'en proceso'
    );

    const proyectosPresupuesto = presupuestoProyectos
        .filter(proyecto =>
            proyecto?.status?.trim().toLowerCase() === 'pendiente' ||
            proyecto?.status?.trim().toLowerCase() === 'en proceso'
        )
        .sort((a, b) => (a.status === 'En Proceso' ? -1 : 1));

    // Manejar clic en gráfica de avance
    const handleAvanceClick = (_, elements) => {
        if (elements.length > 0) {
            const index = elements[0].index;
            navigate(`/proyectos/${proyectosEnProceso[index]._id}`);
        }
    };

    return (
        <Container>
            <h2 className="my-4 text-center">Dashboard de Proyectos</h2>

            {userRole !== 'user' && (
                <Row className="mb-4">
                    {Object.entries(statusCounts).map(([status, count]) => (
                        <Col key={status} md={2}>
                            <Card className="p-3 text-center shadow-sm" style={{ backgroundColor: statusColors[status], color: 'white', borderRadius: '10px' }}>
                                <h3>{count}</h3>
                                <p style={{ fontWeight: 'bold', margin: 0 }}>{status}</p>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {proyectosEnProceso.length > 0 ? (
                <Row>
                    <Col>
                        <Card className="p-3 mt-4">
                            <h4>Avance de Proyectos</h4>
                            <Bar
                                data={{
                                    labels: proyectosEnProceso.map(proyecto => proyecto.nombreProyecto || 'Sin nombre'),
                                    datasets: [{
                                        label: 'Avance (%)',
                                        data: proyectosEnProceso.map(proyecto => proyecto.avance || 0),
                                        backgroundColor: proyectosEnProceso.map((_, index) => colorPalette[index % colorPalette.length])
                                    }],
                                }}
                                options={{
                                    indexAxis: 'y',
                                    onClick: handleAvanceClick,
                                    scales: { x: { max: 100, beginAtZero: true } }
                                }}
                            />
                        </Card>
                    </Col>
                </Row>
            ) : (
                <div className="text-center mt-5">
                    <h4 className="text-muted">No hay proyectos en proceso actualmente</h4>
                    <img src="/images/no-data.png" alt="No hay proyectos" style={{ width: '300px' }} />
                </div>
            )}

            {userRole !== 'user' && proyectosPresupuesto.length > 0 && (
                <Row className="mt-4">
                    {proyectosPresupuesto.map((proyecto, index) => (
                        <Col md={6} key={proyecto._id}>
                            <Card className="p-3 mt-4">
                                <h4>
                                    {proyecto.nombreProyecto}
                                    <span className={`badge ${proyecto.status === 'En Proceso' ? 'bg-success' : 'bg-warning'} ms-2`}>
                                        {proyecto.status}
                                    </span>
                                </h4>
                                {proyecto.utilizado > proyecto.presupuesto && (
                                    <Alert variant="danger">¡Presupuesto excedido!</Alert>
                                )}
                                <Doughnut
                                    data={{
                                        labels: ['Utilizado', 'Restante'],
                                        datasets: [{
                                            data: [
                                                proyecto.utilizado || 0,
                                                Math.max(0, (proyecto.presupuesto || 0) - (proyecto.utilizado || 0))
                                            ],
                                            backgroundColor: ['#FF6384', '#36A2EB'],
                                        }],
                                    }}
                                    options={{
                                        onClick: () => navigate(`/proyectos/${proyecto._id}`)
                                    }}
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {userRole !== 'user' && (
                <Row className="mt-4">
                    <Col>
                        <Card className="p-3 mt-4">
                            <h4>Calendario de Proyectos</h4>
                            <Calendar
                                localizer={localizer}
                                events={events}
                                startAccessor="start"
                                endAccessor="end"
                                style={{ height: 500 }}
                                eventPropGetter={(event) => ({
                                    style: { backgroundColor: event.color, color: 'white' }
                                })}
                                onSelectEvent={(event) => navigate(`/proyectos/${event.projectId}`)}
                            />
                        </Card>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default Home;
