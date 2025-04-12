// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Layout from './components/Layout'; // Importar Layout
import Login from './components/login';
import Home from './components/Home';
import ProyectosAdmin from './components/ProyectosAdmin';
import ProyectoDetails from './components/ProyectoDetails';
import AddProject from './components/AddProject';
import VerProyectos from './components/VerProyectos';
import PrivateRoute from './components/PrivateRoute';
import EditarProyecto from './components/EditarProyecto';
import AgregarTarea from './components/AgregarTarea';
import RegistrarGasto from './components/RegistrarGasto';
import EditarTarea from './components/EditarTarea';
import EditarGasto from './components/EditarGasto';
import AdministrarUsuarios from './components/AdministrarUsuarios';
import CrearUsuario from './components/CrearUsuario';
import CambiarPassword from './components/CambiarPassword';
import CambiarPasswordAdmin from './components/CambiarPasswordAdmin';
import UnderConstruction from './components/UnderConstruction';
import 'bootstrap/dist/css/bootstrap.min.css'; // Esto es necesario para que las clases de Bootstrap funcionen
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import './App.css';
import Sidebar from './components/Sidebar';
import Reportes from './components/reportesIndex';
import ReporteCostos from './components/ReporteCostos';
import DiagramaGantt from './components/DiagramaGantt';


function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* Ruta de Login */}
                    <Route path="/login" element={<Login />} />

                    {/* Ruta para la página de inicio */}
                    <Route path="/home" element={<PrivateRoute><Layout><Home /></Layout></PrivateRoute>} />

                    {/* Ruta para la página de administración de proyectos */}
                    <Route path="/proyectos-admin" element={<PrivateRoute><Layout><ProyectosAdmin /></Layout></PrivateRoute>} />

                    {/* Ruta para los detalles de un proyecto */}
                    <Route path="/proyectos/:id" element={<PrivateRoute><Layout><ProyectoDetails /></Layout></PrivateRoute>} />

                    {/* Ruta para agregar un nuevo proyecto */}
                    <Route path="/proyectos/agregar" element={<PrivateRoute><Layout><AddProject /></Layout></PrivateRoute>} />

                    {/* Ruta para ver todos los proyectos */}
                    <Route path="/proyectos" element={<PrivateRoute><Layout><VerProyectos /></Layout></PrivateRoute>} />

                    {/* Ruta para editar los proyectos */}
                    <Route path="/proyectos/:id/editar" element={<PrivateRoute><Layout><EditarProyecto /></Layout></PrivateRoute>} />

                    {/* Ruta para agregar tareas */}
                    <Route path="/proyectos/:id/agregar-tarea" element={<PrivateRoute><Layout><AgregarTarea /></Layout></PrivateRoute>} />

                    {/* Ruta para registrar gastos */}
                    <Route path="/proyectos/:id/agregar-gasto" element={<PrivateRoute><Layout><RegistrarGasto /></Layout></PrivateRoute>} />

                    {/* Ruta para editar tarea */}
                    <Route path="/proyectos/:id/editar-tarea/:taskId" element={<Layout><EditarTarea /></Layout>} />

                    {/* Ruta para editar gastos */}
                    <Route path="/proyectos/:id/editar-gasto/:gastoId" element={<Layout><EditarGasto /></Layout>} />

                    {/* Ruta para Administrar Usuarios */}
                    <Route path="/AdministrarUsuarios" element={<Layout><AdministrarUsuarios /></Layout>} />

                    {/* Ruta para Crear Usuarios */}
                    <Route path="/CrearUsuario" element={<Layout><CrearUsuario /></Layout>} />

                    {/* Ruta para Cambiar Password usuario autenticado actualmente*/}
                    <Route path="/CambiarPassword" element={<Layout><CambiarPassword /></Layout>} />

                    {/* Ruta para Cambiar Password página de admin */}
                    <Route path="/CambiarPasswordAdmin/:userId" element={<Layout><CambiarPasswordAdmin /></Layout>} /> 

                    {/* Ruta para Pagina de Indice de Reportes */}
                    <Route path="/Reportes" element={<Layout><Reportes /></Layout>} />

                    {/* Ruta para Pagina de Reporte de Costos */}
                    <Route path="/ReporteCostos" element={<Layout><ReporteCostos /></Layout>} />

                    {/* Ruta para Pagina del Grafico de Gantt */}
                    <Route path="/DiagramaGantt" element={<Layout><DiagramaGantt /></Layout>} />

                    {/* Ruta para Pagina en construccion */}
                    <Route path="/en-construccion" element={<UnderConstruction />} />

                    {/* Redirección por defecto a login */}
                    <Route path="*" element={<Navigate to="/login" />} />

                </Routes>
            </div>
        </Router>
    );
}

export default App;
