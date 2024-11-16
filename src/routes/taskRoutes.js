const express = require('express');
const Task = require('../models/tasks');
const Project = require('../models/projects');
const User = require('../models/users');
const verificarRoles = require('../middleware/verificarRoles');
const router = express.Router();

// Crear una nueva tarea (solo admin y manager)
router.post('/', verificarRoles(['admin', 'manager']), async (req, res) => {
    try {
        const { title, description, status, project, assignedTo } = req.body;

        const existingProject = await Project.findById(project);
        if (!existingProject) {
            return res.status(404).json({ message: "Proyecto no encontrado" });
        }

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
router.get('/proyecto/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const tasks = await Task.find({ project: projectId }).populate('assignedTo', 'username email');
        res.status(200).json(tasks);
    } catch (error) {
        console.error("Error al obtener las tareas:", error);
        res.status(500).json({ message: "Error al obtener las tareas", error });
    }
});

// Asignar un usuario a una tarea (solo admin y manager)
router.put('/:id/asignar', verificarRoles(['admin', 'manager']), async (req, res) => {
    try {
        const { id } = req.params;
        const { assignedTo } = req.body;

        const user = await User.findById(assignedTo);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const task = await Task.findByIdAndUpdate(id, { assignedTo }, { new: true });
        res.status(200).json(task);
    } catch (error) {
        console.error("Error al asignar la tarea", error);
        res.status(500).json({ message: "Error al asignar la tarea", error });
    }
});

// Actualizar el estado de una tarea
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const task = await Task.findByIdAndUpdate(id, { status }, { new: true });
        res.status(200).json(task);
    } catch (error) {
        console.error("Error al actualizar la tarea", error);
        res.status(500).json({ message: "Error al actualizar la tarea", error });
    }
});

module.exports = router;
