// frontend/src/components/ProyectoDetails.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from './Navbar'; 

const ProyectoDetails = () => {
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [userRole, setUserRole] = useState(''); // Estado para el rol del usuario
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { id } = useParams(); 

    useEffect(() => {
        fetchProjectDetails();
        fetchUserRole(); // Obtener el rol del usuario
    }, []);

    const fetchUserRole = () => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decodificar el token JWT
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

            // Obtener detalles del proyecto
            const projectResponse = await axios.get(`http://localhost:5000/api/projects/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setProject(projectResponse.data);

            // Obtener tareas del proyecto
            const tasksResponse = await axios.get(`http://localhost:5000/api/tasks/proyecto/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setTasks(tasksResponse.data);

            // Obtener gastos del proyecto solo si el rol no es "user"
            if (userRole !== 'user') {
                const expensesResponse = await axios.get(`http://localhost:5000/api/gastos/project/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setExpenses(expensesResponse.data);

                // Calcular total de los gastos
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
        <div>
            <div className="container mt-5">
                <h2 className="mb-4">Detalles del Proyecto</h2>
                {message && <div className="alert alert-info">{message}</div>}
                {loading ? (
                    <div>Cargando...</div>
                ) : (
                    <>
                        {/* Detalles del Proyecto */}
                        <div className="mb-4">
                            <h3>{project.nombreProyecto}</h3>
                            <p><strong>Descripción:</strong> {project.descripcion}</p>
                            <p><strong>Fecha de Inicio:</strong> {new Date(project.fechaInicio).toLocaleDateString()}</p>
                            <p><strong>Fecha de Fin:</strong> {new Date(project.fechaFin).toLocaleDateString()}</p>
                            <p><strong>Estado:</strong> {project.status}</p>
                        </div>

                        {/* Listado de Tareas */}
                        <h4 className="mt-4">Tareas Relacionadas</h4>
                        <Table striped bordered hover className="mt-3">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Fecha de Inicio</th>
                                    <th>Fecha de Fin</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map((task) => (
                                    <tr key={task._id}>
                                        <td>{task.title}</td>
                                        <td>{new Date(task.startDate).toLocaleDateString()}</td>
                                        <td>{new Date(task.endDate).toLocaleDateString()}</td>
                                        <td>{task.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

                        {/* Mostrar gastos solo si el usuario no es de rol "user" */}
                        {userRole !== 'user' && (
                            <>
                                <h4 className="mt-4">Gastos Relacionados</h4>
                                <Table striped bordered hover className="mt-3">
                                    <thead>
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

                                {/* Total de Gastos */}
                                <div className="mt-4 p-4 bg-light rounded text-center">
                                    <h5>Total de Gastos del Proyecto:</h5>
                                    <h3 className="text-primary">{totalExpenses.toFixed(2)} Lps</h3>
                                </div>
                            </>
                        )}

                        {/* Botón de Regresar */}
                        <div className="mt-4 text-center">
                            <Button variant="secondary" onClick={() => navigate(-1)}>
                                Regresar
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProyectoDetails;
