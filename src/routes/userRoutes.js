// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/users');
const authenticate = require('../middleware/authenticate'); // Verificar si está autenticado
const authorize = require('../middleware/auth'); // Verificar roles

// Registrar un nuevo usuario
router.post('/register', authenticate, authorize(['admin']), async (req, res) => {
    const { username, password, email, role, isActive } = req.body;

    try {
        // Verificar si ya existe un usuario con el mismo nombre o correo
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'El nombre de usuario o correo ya está en uso.' });
        }

        // Generar el hash con bcrypt (deja que bcrypt maneje el prefijo automáticamente)
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        console.log("Contraseña encriptada generada:", hashedPassword);

        // Crear nuevo usuario con la contraseña encriptada
        const newUser = new User({ username, password: hashedPassword, email, role, isActive });
        await newUser.save();
        res.status(201).json({ message: 'Usuario registrado exitosamente', user: { username, email, role } });
    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        res.status(500).json({ message: 'Error al registrar el usuario', error });
    }
});

// Obtener todos los usuarios (solo admin)
router.get('/', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // Excluir contraseña
        res.status(200).json(users);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error al obtener usuarios', error });
    }
});

// Actualizar un usuario (solo admin)
router.put('/:id', authenticate, authorize(['admin']), async (req, res) => {
    const { username, email, role, isActive } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { username, email, role, isActive },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json({ message: 'Usuario actualizado con éxito', user: updatedUser });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: 'Error al actualizar usuario', error });
    }
});

// Eliminar un usuario (solo admin)
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json({ message: 'Usuario eliminado con éxito' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: 'Error al eliminar usuario', error });
    }
});

// Cambiar la contraseña del usuario autenticado
router.put('/change-password', authenticate, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar la contraseña actual
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
        }

        // Actualizar la contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Contraseña actualizada con éxito' });
    } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
        res.status(500).json({ message: 'Error al cambiar la contraseña', error });
    }
});

// Cambiar la contraseña de un usuario (solo admin)
router.put('/:id/change-password', authenticate, authorize(['admin']), async (req, res) => {
    const { newPassword } = req.body;

    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Actualizar la contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Contraseña actualizada con éxito por el administrador' });
    } catch (error) {
        console.error('Error al cambiar la contraseña por el administrador:', error);
        res.status(500).json({ message: 'Error al cambiar la contraseña', error });
    }
});

module.exports = router;
