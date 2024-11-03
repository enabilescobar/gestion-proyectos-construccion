const express = require('express');
const Project = require('../models/projects');
const User = require('../models/users');
const authorize = require('../middleware/auth');
const router = express.Router();

// Crear un nuevo proyecto
router.post('/', authorize(['admin', 'manager']), async (req, res) => {
    try {
        const { nombreProyecto, descripcion, fechaInicio, fechaFin, createdBy } = req.body;

        // Buscar al usuario por su ID
        const user = await User.findById(createdBy);

        if (!user) {
            return res.status(400).json({ message: "Usuario no encontrado" });
        }

        // Crear un nuevo proyecto
        const newProject = new Project({
            nombreProyecto,
            descripcion,
            fechaInicio,
            fechaFin,
            createdBy: user._id,
            createdAt: new Date()
        });

        await newProject.save();
        res.status(201).json(newProject);
    } catch (error) {
        console.error("Error al crear el proyecto:", error);
        res.status(400).json({ message: "Error al crear el proyecto", error });
    }
});

// Obtener todos los proyectos
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find().populate('createdBy', 'username email');
        res.status(200).json(projects);
    } catch (error) {
        console.error("Error al obtener proyectos:", error);
        res.status(500).json({ message: 'Error al obtener proyectos', error });
    }
});

module.exports = router;
