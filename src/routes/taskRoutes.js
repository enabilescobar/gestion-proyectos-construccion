// src/routes/taskRoutes.js
const express = require('express');
const Task = require('../models/tasks');
const Project = require('../models/projects');
const User = require('../models/users');
const authenticate = require('../middleware/authenticate'); // Para asegurar que el usuario esté autenticado
const authorize = require('../middleware/auth'); // Para verificar roles
const router = express.Router();

// Crear una nueva tarea (solo admin y manager)
router.post('/', authenticate, authorize(['admin', 'manager']), async (req, res) => {
    try {
        const { title, description, status, project, startDate, endDate, assignedTo } = req.body;

        // Verificar que el proyecto exista
        const existingProject = await Project.findById(project);
        if (!existingProject) {
            return res.status(404).json({ message: "Proyecto no encontrado" });
        }

        // Crear nueva tarea
        const newTask = new Task({
            title,
            description,
            status,
            project,
            startDate,
            endDate,
            assignedTo,
        });

        await newTask.save();
        res.status(201).json({ message: "Tarea creada con éxito", task: newTask });
    } catch (error) {
        console.error("Error al crear la tarea", error);
        res.status(500).json({ message: "Error al crear la tarea", error });
    }
});

// Obtener todas las tareas de un proyecto
router.get('/proyecto/:projectId', authenticate, authorize(['admin', 'manager', 'user']), async (req, res) => {
    try {
        const { projectId } = req.params;
        const tasks = await Task.find({ project: projectId }).populate('assignedTo', 'username email');
        res.status(200).json(tasks);
    } catch (error) {
        console.error("Error al obtener las tareas:", error);
        res.status(500).json({ message: "Error al obtener las tareas", error });
    }
});

// Obtener una tarea por ID
router.get('/:id', authenticate, authorize(['admin', 'manager', 'user']), async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id).populate('assignedTo', 'username email');
        if (!task) {
            return res.status(404).json({ message: "Tarea no encontrada" });
        }
        res.status(200).json(task);
    } catch (error) {
        console.error("Error al obtener la tarea:", error);
        res.status(500).json({ message: "Error al obtener la tarea", error });
    }
});

// Actualizar una tarea completa (solo admin y manager)
router.put('/:id', authenticate, authorize(['admin', 'manager']), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, startDate, endDate, assignedTo } = req.body;

        const task = await Task.findByIdAndUpdate(
            id,
            { title, description, status, startDate, endDate, assignedTo },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({ message: "Tarea no encontrada" });
        }

        res.status(200).json({ message: "Tarea actualizada con éxito", task });
    } catch (error) {
        console.error("Error al actualizar la tarea:", error);
        res.status(500).json({ message: "Error al actualizar la tarea", error });
    }
});

// Eliminar una tarea (solo admin)
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { id } = req.params;

        const deletedTask = await Task.findByIdAndDelete(id);
        if (!deletedTask) {
            return res.status(404).json({ message: "Tarea no encontrada" });
        }

        res.status(200).json({ message: "Tarea eliminada con éxito" });
    } catch (error) {
        console.error("Error al eliminar la tarea:", error);
        res.status(500).json({ message: "Error al eliminar la tarea", error });
    }
});

// Asignar un usuario a una tarea (solo admin y manager)
router.put('/:id/asignar', authenticate, authorize(['admin', 'manager']), async (req, res) => {
    try {
        const { id } = req.params;
        const { assignedTo } = req.body;

        const user = await User.findById(assignedTo);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const task = await Task.findByIdAndUpdate(id, { assignedTo }, { new: true });
        if (!task) {
            return res.status(404).json({ message: "Tarea no encontrada" });
        }

        res.status(200).json({ message: "Tarea asignada con éxito", task });
    } catch (error) {
        console.error("Error al asignar la tarea", error);
        res.status(500).json({ message: "Error al asignar la tarea", error });
    }
});

module.exports = router;
