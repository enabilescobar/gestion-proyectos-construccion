import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            {/* Sidebar fija en la izquierda */}
            <div style={{
                position: 'fixed', /* Fija la sidebar */
                top: 0,
                left: 0,
                height: '100vh',
                width: '250px',
                backgroundColor: '#343a40', /* Ajusta el color de fondo de la Sidebar */
                zIndex: 1000, /* Asegura que la sidebar esté por encima del contenido */
                paddingTop: '0px' /* Ajusta el espacio si tienes una navbar */
            }}>
                <Sidebar />
            </div>

            {/* Contenido principal a la derecha de la Sidebar */}
            <div style={{
                flex: 1,
                marginLeft: '250px', /* El contenido principal no se superpone con la sidebar */
                paddingTop: '0px' /* Evita que el contenido se superponga con la navbar */
            }}>
                <Navbar /> {/* Navbar en la parte superior */}
                <div className="container mt-4">
                    {children} {/* Aquí se renderiza el contenido específico de cada página */}
                </div>
            </div>
        </div>
    );
};

export default Layout;
