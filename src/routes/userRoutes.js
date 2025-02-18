// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/users');
const { registrarActividad } = require('../controllers/bitacoraController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/auth');

// Cambiar la contraseña del usuario autenticado
router.put('/change-password', authenticate, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        // Buscar al usuario autenticado
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

        // Registrar actividad en la bitácora
        await registrarActividad(req.user.id, 'Cambio de contraseña', 'El usuario cambió su contraseña.');

        res.status(200).json({ message: 'Contraseña actualizada con éxito' });
    } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
        res.status(500).json({ message: 'Error al cambiar la contraseña', error });
    }
});

// Cambiar la contraseña de un usuario (solo admin)
// Cambiar la contraseña de un usuario (solo admin)
router.put('/:id/change-password', authenticate, authorize(['admin']), async (req, res) => {
    const { newPassword } = req.body;

    try {
        // Buscar al usuario cuyo ID se pasó en la solicitud
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Actualizar la contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        // Registrar actividad en la bitácora
        await registrarActividad(
            req.user.id,
            'Cambio de contraseña por admin',
            `El administrador cambió la contraseña del usuario "${user.username}".`
        );

        res.status(200).json({ message: 'Contraseña actualizada con éxito por el administrador' });
    } catch (error) {
        console.error('Error al cambiar la contraseña por el administrador:', error);
        res.status(500).json({ message: 'Error al cambiar la contraseña', error });
    }
});

// Registrar un nuevo usuario
router.post('/register', authenticate, authorize(['admin', 'manager']), async (req, res) => {
    const { username, password, email, role, isActive, nombre, apellido, direccion, telefono, fechaNacimiento } = req.body;

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'El nombre de usuario o correo ya está en uso.' });
        }

        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            username,
            password: hashedPassword,
            email,
            role,
            isActive,
            nombre,
            apellido,
            direccion,
            telefono,
            fechaNacimiento,
        });
        await newUser.save();

        // Registrar actividad en la bitácora
        await registrarActividad(
            req.user.id,
            'Registro de usuario',
            `El usuario "${username}" con rol "${role}" fue registrado.`
        );

        res.status(201).json({ message: 'Usuario registrado exitosamente', user: { username, email, role, nombre, apellido } });
    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        res.status(500).json({ message: 'Error al registrar el usuario', error });
    }
});

// Obtener todos los usuarios (solo admin)
router.get('/', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.status(200).json(users);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error al obtener usuarios', error });
    }
});

// Actualizar un usuario (solo admin)
router.put('/:id', authenticate, authorize(['admin']), async (req, res) => {
    const { username, email, role, isActive, nombre, apellido, direccion, telefono, fechaNacimiento } = req.body;

    try {
        const existingUser = await User.findById(req.params.id);
        if (!existingUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Detectar cambios en los campos del usuario
        let cambios = [];
        if (existingUser.username !== username) cambios.push(`Nombre de usuario cambiado de "${existingUser.username}" a "${username}"`);
        if (existingUser.email !== email) cambios.push(`Correo cambiado de "${existingUser.email}" a "${email}"`);
        if (existingUser.role !== role) cambios.push(`Rol cambiado de "${existingUser.role}" a "${role}"`);
        if (existingUser.isActive !== isActive) cambios.push(`Estado cambiado a "${isActive ? 'Activo' : 'Inactivo'}"`);
        if (existingUser.nombre !== nombre || existingUser.apellido !== apellido) cambios.push(`Nombre actualizado`);
        if (existingUser.direccion !== direccion) cambios.push(`Dirección actualizada`);
        if (existingUser.telefono !== telefono) cambios.push(`Teléfono actualizado`);
        if (existingUser.fechaNacimiento && fechaNacimiento && new Date(existingUser.fechaNacimiento).toISOString() !== new Date(fechaNacimiento).toISOString()) {
            cambios.push(`Fecha de nacimiento actualizada`);
        }

        // Actualizar el usuario
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { username, email, role, isActive, nombre, apellido, direccion, telefono, fechaNacimiento },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Registrar actividad en la bitácora
        if (cambios.length > 0) {
            await registrarActividad(req.user.id, 'Actualización de usuario', `Usuario "${username}" actualizado: ${cambios.join(', ')}`);
        } else {
            await registrarActividad(req.user.id, 'Actualización de usuario', `Se intentó actualizar el usuario "${username}" sin cambios.`);
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
        // Buscar al usuario antes de eliminarlo
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Eliminar el usuario
        await user.deleteOne();

        // Registrar actividad en la bitácora
        await registrarActividad(
            req.user.id,
            'Eliminación de usuario',
            `Usuario "${user.username}" con rol "${user.role}" eliminado.`
        );

        res.status(200).json({ message: 'Usuario eliminado con éxito' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: 'Error al eliminar usuario', error });
    }
});

module.exports = router;
