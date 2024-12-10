// src/middleware/authenticate.js
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Obtener el token del header

    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado: No se proporcionó un token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY); 
        req.user = decoded; 
        console.log('Usuario autenticado:', req.user);
        next(); 
    } catch (error) {
        console.error('Error al autenticar el token:', error);
        res.status(401).json({ message: 'Token no válido' });
    }
};

module.exports = authenticate;
