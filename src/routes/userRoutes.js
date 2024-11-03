const express = require('express');
const router = express.Router();
const User = require('../models/users');

// Registrar un nuevo usuario
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        // Verificar si ya existe un usuario con el mismo nombre o correo
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'El nombre de usuario o correo ya está en uso.' });
        }

        // Crear nuevo usuario
        const newUser = new User({ username, password, email });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        console.error("Error al registrar el usuario:", error);
        res.status(500).json({ message: 'Error al registrar el usuario', error });
    }
});

// Iniciar sesión
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        
        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        res.status(200).json({ message: 'Inicio de sesión exitoso.' });
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        res.status(500).json({ message: 'Error al iniciar sesión', error });
    }
});


// Obtener el _id de un usuario
router.get('/getUserId/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        res.json({ _id: user._id });
    } catch (error) {
        console.error("Error al obtener el _id del usuario", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
});

module.exports = router;
