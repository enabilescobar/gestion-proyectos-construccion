import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, ProgressBar, Card } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';

const ProyectoDetails = () => {
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [userRole, setUserRole] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        fetchUserRole();
    }, []);

    useEffect(() => {
        if (userRole) {
            fetchProjectDetails();
        }
    }, [userRole]);

    const fetchUserRole = () => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken = JSON.parse(atob(token.split('.')[1]));
                setUserRole(decodedToken.role);
            } catch (error) {
                console.error('Error al decodificar el token:', error);
            }
        }
    };

    const fetchProjectDetails = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setMessage('No se encontró un token válido. Por favor, inicia sesión nuevamente.');
                return;
            }

            const projectResponse = await axios.get(`http://localhost:5000/api/projects/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (projectResponse.data) {
                setProject(projectResponse.data);
            } else {
                setMessage('No se encontraron datos del proyecto.');
            }

            const tasksResponse = await axios.get(`http://localhost:5000/api/tasks/proyecto/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTasks(tasksResponse.data);

            if (userRole !== 'user') {
                const expensesResponse = await axios.get(`http://localhost:5000/api/gastos/project/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setExpenses(expensesResponse.data);

                const total = expensesResponse.data.reduce((acc, expense) => acc + expense.amount, 0);
                setTotalExpenses(total);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error al obtener los datos del proyecto:', error);
            setMessage('Error al cargar los datos del proyecto.');
            setLoading(false);
        }
    };

    return (
        <div className="container my-5">
            <h1 className="mb-4 text-center">Detalles del Proyecto</h1>
            {message && <div className="alert alert-info">{message}</div>}

            {loading ? (
                <div className="text-center">Cargando...</div>
            ) : (
                <>
                    <Card className="mb-4 shadow-sm p-4">
                        <Card.Body>
                            <Card.Title as="h2" className="mb-3">{project?.nombreProyecto}</Card.Title>
                            <Card.Text>
                                <strong>Descripción:</strong> {project?.descripcion}
                            </Card.Text>
                            {userRole !== 'user' && (
                                <Card.Text>
                                    <strong>Presupuesto:</strong> {project?.presupuesto.toLocaleString()} Lps
                                </Card.Text>
                            )}
                            <Card.Text><strong>Fecha de Inicio:</strong> {new Date(project?.fechaInicio).toISOString().split('T')[0]}</Card.Text>
                            <Card.Text><strong>Fecha de Fin:</strong> {new Date(project?.fechaFin).toISOString().split('T')[0]}</Card.Text>
                            <Card.Text><strong>Estado:</strong> {project?.status}</Card.Text>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4 shadow-sm p-4">
                        <Card.Body>
                            <h4 className="mb-3">Avance del Proyecto</h4>
                            <div className="d-flex align-items-center mb-2">
                                <span className="me-2"><strong>Completado:</strong> {project?.avance ?? 0}%</span>
                            </div>
                            <ProgressBar now={project?.avance ?? 0} label={`${project?.avance ?? 0}%`} />
                        </Card.Body>
                    </Card>

                    <Card className="mb-4 shadow-sm p-4">
                        <Card.Body>
                            <h4 className="mb-3">Tareas Relacionadas</h4>
                            <Table responsive borderless hover className="align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Fecha de Inicio</th>
                                        <th>Fecha de Fin</th>
                                        <th>Estado</th>
                                        <th>Dependencias</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tasks.map((task) => (
                                        <tr key={task._id}>
                                            <td>{task.title}</td>
                                            <td>{new Date(task.startDate).toISOString().split('T')[0]}</td>
                                            <td>{new Date(task.endDate).toISOString().split('T')[0]}</td>
                                            <td>{task.status}</td>
                                            <td>
                                                {task.dependencias && task.dependencias.length > 0 ? (
                                                    <ul className="list-unstyled mb-0">
                                                        {task.dependencias.map(dep => (
                                                            <li key={dep._id}>{dep.title}</li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <span className="text-muted">Sin dependencias</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>

                    {userRole !== 'user' && (
                        <Card className="mb-5 shadow-sm p-4">
                            <Card.Body>
                                <h4 className="mb-3">Gastos Relacionados</h4>
                                <Table responsive borderless hover className="align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Categoría</th>
                                            <th>Realizado por</th>
                                            <th>Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expenses.map((expense) => (
                                            <tr key={expense._id}>
                                                <td>{expense.category}</td>
                                                <td>{expense.doneBy}</td>
                                                <td>{expense.amount.toFixed(2)} Lps</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>

                                <div className="mt-4 p-4 bg-light rounded text-center">
                                    <h5>Total de Gastos del Proyecto:</h5>
                                    <h3 className="text-primary">{totalExpenses.toFixed(2)} Lps</h3>

                                    {project.presupuesto > 0 && (
                                        <div className="mt-3">
                                            <h5>Presupuesto Utilizado:</h5>
                                            <h3
                                                style={{
                                                    color: totalExpenses > project.presupuesto ? 'red' : 'green'
                                                }}
                                            >
                                                {((totalExpenses / project.presupuesto) * 100).toFixed(2)}%
                                            </h3>
                                            {totalExpenses > project.presupuesto ? (
                                                <p className="text-danger fw-bold">¡Has excedido el presupuesto!</p>
                                            ) : (
                                                <p className="text-success">Dentro del presupuesto</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    )}

                    <div className="text-center">
                        <Button variant="outline-secondary" className="me-3 px-4 py-2" onClick={() => navigate(-1)}>
                            Regresar
                        </Button>
                        <Button variant="primary" className="px-4 py-2" onClick={() => navigate(`/proyectos/${id}/editar`)}>
                            Actualizar Proyecto
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ProyectoDetails;
