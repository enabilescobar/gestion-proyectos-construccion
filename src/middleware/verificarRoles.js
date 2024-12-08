// src/middleware/verificarRoles.js
function verificarRoles(rolesPermitidos) {
    return (req, res, next) => {
        console.log('Rol del usuario:', req.user?.role); // Verifica el rol
        const userRole = req.user?.role; // Obtener el rol del usuario autenticado

        if (!userRole || !rolesPermitidos.includes(userRole)) {
            return res.status(403).json({ message: 'Permiso denegado: No tienes los roles necesarios' });
        }

        console.log('Rol autorizado:', userRole); // Log para verificar roles permitidos
        next(); // Continuar con la siguiente función
    };
}

module.exports = verificarRoles;
