const express = require('express');
const Task = require('../models/tasks');
const Project = require('../models/projects');
const User = require('../models/users');
const router = express.Router();

// Crear una nueva tarea
router.post('/', async (req, res) => {
    try {
        const { title, description, status, project, assignedTo, createdBy } = req.body;

        // Verificar si el usuario tiene permisos (debe ser admin o manager)
        const user = await User.findById(createdBy);
        if (!user || !['admin', 'manager'].includes(user.role)) {
            return res.status(403).json({ message: "Permiso denegado. Solo administradores o managers pueden crear tareas." });
        }

        // Verificar si el proyecto existe
        const existingProject = await Project.findById(project);
        if (!existingProject) {
            return res.status(404).json({ message: "Proyecto no encontrado" });
        }

        // Crear la nueva tarea
        const newTask = new Task({
            title,
            description,
            status,
            project,
            assignedTo
        });

        await newTask.save();
        res.status(201).json(newTask);
    } catch (error) {
        console.error("Error al crear la tarea", error);
        res.status(500).json({ message: "Error al crear la tarea", error });
    }
});

// Obtener todas las tareas de un proyecto
router.get('/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        
        // Verificar si el proyecto existe
        const existingProject = await Project.findById(projectId);
        if (!existingProject) {
            return res.status(404).json({ message: "Proyecto no encontrado" });
        }

        // Obtener las tareas asociadas al proyecto
        const tasks = await Task.find({ project: projectId }).populate('assignedTo', 'username email');
        res.status(200).json(tasks);
    } catch (error) {
        console.error("Error al obtener las tareas:", error);
        res.status(500).json({ message: "Error al obtener las tareas", error });
    }
});

module.exports = router;
