const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/users'); // Asegúrate de importar el modelo de usuario

// Ruta de inicio de sesión
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar al usuario por correo electrónico
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Correo o contraseña incorrectos 3' });
        }

        // Verificar la contraseña encriptada
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Correo o contraseña incorrectos 4' });
        }

        // Si la autenticación es exitosa, puedes generar un token o enviar un mensaje de éxito
        res.status(200).json({ message: 'Inicio de sesión exitoso', userId: user._id });
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        res.status(500).json({ message: 'Error al iniciar sesión', error });
    }
});

module.exports = router;
