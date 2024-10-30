const express = require('express');
const router = express.Router();
const User = require('../models/users'); 

// Registrar un nuevo usuario
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Buscar si el usuario ya existe
        const { username, password } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).send('El nombre de usuario ya está en uso.');
        }

        // Crear y guardar el nuevo usuario
        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        res.status(500).send('Error al registrar el usuario.');
    }
});

// Iniciar sesión
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || user.password !== password) {
            return res.status(401).send('Credenciales inválidas.');
        }

        res.status(200).send('Inicio de sesión exitoso.');
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).send('Error al iniciar sesión.');
    }
});

module.exports = router;
