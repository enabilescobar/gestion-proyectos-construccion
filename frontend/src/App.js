// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
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
import UnderConstruction from './components/UnderConstruction';
import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* Ruta de Login */}
                    <Route path="/login" element={<Login />} />

                    {/* Ruta para la página de inicio */}
                    <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />

                    {/* Ruta para la página de administración de proyectos */}
                    <Route path="/proyectos-admin" element={<PrivateRoute><ProyectosAdmin /></PrivateRoute>} />

                    {/* Ruta para los detalles de un proyecto */}
                    <Route path="/proyectos/:id" element={<PrivateRoute><ProyectoDetails /></PrivateRoute>} />

                    {/* Ruta para agregar un nuevo proyecto */}
                    <Route path="/proyectos/agregar" element={<PrivateRoute><AddProject /></PrivateRoute>} />

                    {/* Ruta para ver todos los proyectos */}
                    <Route path="/proyectos" element={<PrivateRoute><VerProyectos /></PrivateRoute>} />

                    {/* Ruta para editar los proyectos */}
                    <Route path="/proyectos/:id/editar" element={<PrivateRoute><EditarProyecto /></PrivateRoute>} />

                    {/* Ruta para agregar tareas */}
                    <Route path="/proyectos/:id/agregar-tarea" element={<PrivateRoute><AgregarTarea /></PrivateRoute>} />

                    {/* Ruta para registrar gastos */}
                    <Route path="/proyectos/:id/agregar-gasto" element={<PrivateRoute><RegistrarGasto /></PrivateRoute>} />

                    {/* Ruta para editar tarea */}
                    <Route path="/proyectos/:id/editar-tarea/:taskId" element={<EditarTarea />} />

                    {/* Ruta para editar gastos */}
                    <Route path="/proyectos/:id/editar-gasto/:gastoId" element={<EditarGasto />} />

                    {/* Ruta para Administrar Usuarios */}
                    <Route path="/AdministrarUsuarios" element={<AdministrarUsuarios />} />

                    {/* Ruta para Crear Usuarios */}
                    <Route path="/CrearUsuario" element={<CrearUsuario />} />

                    {/* Ruta para Cambiar Password */}
                    <Route path="/CambiarPassword" element={<CambiarPassword />} />

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
