// src/middleware/auth.js
const authorize = (roles) => {
    return (req, res, next) => {
        try {
            // Verifica si req.user existe y si el rol está permitido
            console.log('Usuario en authorize:', req.user); // log para verificar usuario
            const userRole = req.user?.role; // El rol del usuario autenticado
            if (!userRole || !roles.includes(userRole)) {
                console.log('Permiso denegado: Rol insuficiente');
                return res.status(403).json({ message: "Permisos insuficientes 1" });
            }
            next(); // Permite la continuación si los permisos son válidos
        } catch (error) {
            console.error('Error de autorización:', error);
            res.status(500).json({ message: "Error de autorización", error });
        }
    };
};

module.exports = authorize;
