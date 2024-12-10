// src/middleware/verificarRoles.js
function verificarRoles(rolesPermitidos) {
    return (req, res, next) => {
        console.log('Rol del usuario:', req.user?.role); 
        const userRole = req.user?.role; 

        if (!userRole || !rolesPermitidos.includes(userRole)) {
            return res.status(403).json({ message: 'Permiso denegado: No tienes los roles necesarios' });
        }

        console.log('Rol autorizado:', userRole); 
        next(); 
    };
}

module.exports = verificarRoles;
