import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { Home, FolderKanban, Users2, BarChart2, Bell } from 'lucide-react';

const Sidebar = () => {
    const [userRole, setUserRole] = useState('');
    const [notiCount, setNotiCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserRole(decoded.role);

                // Obtener notificaciones no leídas si es admin o manager
                if (decoded.role === 'admin' || decoded.role === 'manager') {
                    axios.get('http://localhost:5000/api/notifications', {
                        headers: { Authorization: `Bearer ${token}` }
                    }).then(res => {
                        const noLeidas = res.data.filter(n => !n.leida);
                        setNotiCount(noLeidas.length);
                    }).catch(err => {
                        console.error('Error al obtener notificaciones:', err);
                    });
                }
            } catch (error) {
                console.error('Error al decodificar el token:', error);
            }
        }
    }, []);

    return (
        <div className="sidebar bg-dark text-white p-3" style={{ height: '100vh' }}>
            <h3>InOrder</h3>
            <ul className="nav flex-column">
                <li className="nav-item">
                    <Link to="/home" className="nav-link text-white"><Home size={18} className="me-2" />Inicio</Link>
                </li>
                <li className="nav-item">
                    <Link to="/proyectos-admin" className="nav-link text-white"><FolderKanban size={18} className="me-2" />Proyectos</Link>
                </li>

                {(userRole === 'admin') && (
                    <li className="nav-item">
                        <Link to="/AdministrarUsuarios" className="nav-link text-white"><Users2 size={18} className="me-2" />Usuarios</Link>
                    </li>
                )}

                {(userRole === 'admin' || userRole === 'manager') && (
                    <li className="nav-item">
                        <Link to="/Reportes" className="nav-link text-white"><BarChart2 size={18} className="me-2" />Reportes</Link>
                    </li>
                )}

                {/* Notificaciones solo para admin y manager */}
                {(userRole === 'admin' || userRole === 'manager') && (
                    <li
                        className="nav-item d-flex justify-content-between align-items-center"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate('/notificaciones')}
                    >
                        <span className="nav-link text-white d-flex align-items-center">
                            <Bell size={18} className="me-2" />
                            Notificaciones
                        </span>
                        {notiCount > 0 && (
                            <span className="badge bg-danger rounded-pill me-2">{notiCount}</span>
                        )}
                    </li>
                )}
            </ul>
        </div>
    );
};

export default Sidebar;
