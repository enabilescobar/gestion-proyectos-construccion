function verificarRoles(rolesPermitidos) {
    return (req, res, next) => {
        if (!req.user || !rolesPermitidos.includes(req.user.role)) {
            return res.status(403).json({ message: 'Permiso denegado' });
        }
        next();
    };
}

module.exports = verificarRoles;
