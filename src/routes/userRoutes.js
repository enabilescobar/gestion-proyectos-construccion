const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
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

        // Encriptar la contraseña antes de guardar
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear nuevo usuario con la contraseña encriptada
        const newUser = new User({ username, password: hashedPassword, email });
        await newUser.save();
        res.status(201).json({ message: 'Usuario registrado exitosamente', user: { username, email } });
    } catch (error) {
        console.error("Error al registrar el usuario:", error);
        res.status(500).json({ message: 'Error al registrar el usuario', error });
    }
});

// Iniciar sesión
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        //Buscar usuario por userName
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // Verificar la contraseña encriptada
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        res.status(200).json({ message: 'Inicio de sesión exitoso.' });
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        res.status(500).json({ message: 'Error al iniciar sesión', error });
    }
});

module.exports = router;
