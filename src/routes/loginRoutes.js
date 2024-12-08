// src/routes/loginRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/users');
const router = express.Router();
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY; // Asegúrate de que está definida

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log('Cuerpo recibido:', req.body); // Verificar datos de entrada

        // Buscar usuario por email
        const user = await User.findOne({ email });
        if (!user) {
            console.log('Usuario no encontrado');
            return res.status(401).json({ message: 'Correo o contraseña incorrectas' });
        }

        console.log('Usuario encontrado:', user);

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Contraseña incorrecta');
            return res.status(401).json({ message: 'Correo o contraseña incorrectas' });
        }

        // Generar token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role, username: user.username },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        console.log('Token generado:', token);

        // Responder con el token y datos del usuario
        const response = {
            message: 'Inicio de sesión exitoso',
            token: token,
            userId: user._id,
            role: user.role
        };

        console.log('Respuesta del servidor:', response);

        return res.status(200).json(response);
    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        return res.status(500).json({ message: 'Error al procesar la solicitud', error: error.message });
    }
});

router.get('/test-jwt', (req, res) => {
    const testPayload = {
        id: "test123",
        email: "test@example.com",
        role: "admin",
    };

    try {
        const token = jwt.sign(testPayload, process.env.SECRET_KEY, { expiresIn: '1h' });
        console.log('Token generado:', token); // Verificar token en logs
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error al generar el token:', error);
        res.status(500).json({ message: 'Error al generar el token', error: error.message });
    }
});

module.exports = router;
