// src/routes/taskRoutes.js
const express = require('express');
const Task = require('../models/tasks');
const Project = require('../models/projects');
const User = require('../models/users');
const { registrarActividad } = require('../controllers/bitacoraController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/auth');
const router = express.Router();

// Crear una nueva tarea (solo admin y manager)
router.post('/', authenticate, authorize(['admin', 'manager']), async (req, res) => {
    try {
        const { title, description, status, project, startDate, endDate, assignedTo, dependencias } = req.body;

        // Verificar que el proyecto exista
        const existingProject = await Project.findById(project);
        if (!existingProject) {
            return res.status(404).json({ message: "Proyecto no encontrado" });
        }

        // Validar dependencias
        if (dependencias && dependencias.length > 0) {
            const dependencyTasks = await Task.find({ _id: { $in: dependencias }, project });
            if (dependencyTasks.length !== dependencias.length) {
                return res.status(400).json({ message: "Algunas dependencias no existen o no pertenecen al mismo proyecto." });
            }

            // Verificar dependencias circulares
            const hasCircularDependency = async (taskId, dependencias) => {
                const visited = new Set();
                const checkCycle = async (currentTaskId) => {
                    if (visited.has(currentTaskId)) {
                        return true; // Se detectó un ciclo
                    }
                    visited.add(currentTaskId);

                    const task = await Task.findById(currentTaskId);
                    if (!task) return false;

                    for (const dep of task.dependencias) {
                        if (await checkCycle(dep.toString())) {
                            return true;
                        }
                    }
                    visited.delete(currentTaskId);
                    return false;
                };

                for (const dep of dependencias) {
                    if (await checkCycle(dep.toString())) {
                        return true;
                    }
                }
                return false;
            };

            if (await hasCircularDependency(null, dependencias)) {
                return res.status(400).json({ message: "Se ha detectado una dependencia circular." });
            }
        }

        // Validar que las fechas de la tarea estén dentro del rango del proyecto
        const projectStart = new Date(existingProject.fechaInicio);
        const projectEnd = new Date(existingProject.fechaFin);
        const taskStart = new Date(startDate);
        const taskEnd = endDate ? new Date(endDate) : null;

        if (taskStart < projectStart || (taskEnd && taskEnd > projectEnd)) {
            return res.status(400).json({
                message: "Las fechas de la tarea deben estar dentro del intervalo del proyecto.",
            });
        }

        // Validar que la fecha de inicio sea anterior o igual a la fecha de fin
        if (taskEnd && taskStart > taskEnd) {
            return res.status(400).json({ message: "La fecha de inicio debe ser anterior o igual a la fecha de fin." });
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
            dependencias,
        });

        await newTask.save();

        // Registrar actividad en la bitácora
        await registrarActividad(req.user.id, 'Creación de tarea', `Se creó la tarea "${title}" en el proyecto "${project}".`);

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
        const tasks = await Task.find({ project: projectId })
            .populate('assignedTo', 'username email')
            .populate('dependencias', 'title status startDate endDate');
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
        const task = await Task.findById(id)
            .populate('assignedTo', 'username email')
            .populate('dependencias', 'title status startDate endDate');
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
        const { title, description, status, startDate, endDate, assignedTo, project, dependencias } = req.body;

        // Verificar que la tarea exista
        const existingTask = await Task.findById(id);
        if (!existingTask) {
            return res.status(404).json({ message: "Tarea no encontrada" });
        }

        // Verificar que el proyecto exista
        const existingProject = await Project.findById(project || existingTask.project);
        if (!existingProject) {
            return res.status(404).json({ message: "Proyecto no encontrado" });
        }

        // Validar dependencias
        if (dependencias && dependencias.length > 0) {
            const dependencyTasks = await Task.find({ _id: { $in: dependencias }, project: existingProject._id });
            if (dependencyTasks.length !== dependencias.length) {
                return res.status(400).json({ message: "Algunas dependencias no existen o no pertenecen al mismo proyecto." });
            }

            // Verificar dependencias circulares
            const hasCircularDependency = async (taskId, dependencias) => {
                const visited = new Set();
                const checkCycle = async (currentTaskId) => {
                    if (visited.has(currentTaskId)) {
                        return true; // Se detectó un ciclo
                    }
                    visited.add(currentTaskId);

                    const task = await Task.findById(currentTaskId);
                    if (!task) return false;

                    for (const dep of task.dependencias) {
                        if (await checkCycle(dep.toString())) {
                            return true;
                        }
                    }
                    visited.delete(currentTaskId);
                    return false;
                };

                for (const dep of dependencias) {
                    if (await checkCycle(dep.toString())) {
                        return true;
                    }
                }
                return false;
            };

            if (await hasCircularDependency(id, dependencias)) {
                return res.status(400).json({ message: "Se ha detectado una dependencia circular." });
            }
        }

        // Evitar marcar la tarea como Completado si tiene dependencias pendientes
        if (status === 'Completado' && existingTask.dependencias.length > 0) {
            const pendingDependencies = await Task.find({
                _id: { $in: existingTask.dependencias },
                status: { $ne: 'Completado' }
            });

            if (pendingDependencies.length > 0) {
                return res.status(400).json({
                    message: "No se puede completar la tarea hasta que todas las dependencias estén completadas.",
                    pendingTasks: pendingDependencies.map(task => task.title)
                });
            }
        }

        // Validar que las fechas de la tarea estén dentro del rango del proyecto
        const projectStart = new Date(existingProject.fechaInicio);
        const projectEnd = new Date(existingProject.fechaFin);
        const taskStart = new Date(startDate);
        const taskEnd = endDate ? new Date(endDate) : null;

        if (taskStart < projectStart || (taskEnd && taskEnd > projectEnd)) {
            return res.status(400).json({
                message: "Las fechas de la tarea deben estar dentro del intervalo del proyecto.",
            });
        }

        // Validar que la fecha de inicio sea anterior o igual a la fecha de fin
        if (taskEnd && taskStart > taskEnd) {
            return res.status(400).json({ message: "La fecha de inicio debe ser anterior o igual a la fecha de fin." });
        }

        // Detectar cambios en la tarea antes de actualizar
        let cambios = [];
        if (existingTask.title !== title) cambios.push(`Título cambiado de "${existingTask.title}" a "${title}"`);
        if (existingTask.description !== description) cambios.push(`Descripción actualizada`);
        if (existingTask.status !== status) cambios.push(`Estado cambiado de "${existingTask.status}" a "${status}"`);
        if (existingTask.startDate.toISOString() !== new Date(startDate).toISOString()) cambios.push(`Fecha de inicio actualizada`);
        if (existingTask.endDate && endDate && existingTask.endDate.toISOString() !== new Date(endDate).toISOString()) cambios.push(`Fecha de fin actualizada`);
        if (JSON.stringify(existingTask.assignedTo) !== JSON.stringify(assignedTo)) cambios.push(`Responsable actualizado`);
        if (JSON.stringify(existingTask.dependencias) !== JSON.stringify(dependencias)) cambios.push(`Dependencias actualizadas`);

        // Actualizar la tarea
        const updatedTask = await Task.findByIdAndUpdate(
            id,
            { title, description, status, startDate, endDate, assignedTo, dependencias },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: "Tarea no encontrada" });
        }

        // Registrar cambios en la bitácora
        if (cambios.length > 0) {
            await registrarActividad(req.user.id, 'Actualización de tarea', `Tarea "${title}" actualizada: ${cambios.join(', ')}`);
        } else {
            await registrarActividad(req.user.id, 'Actualización de tarea', `Se intentó actualizar la tarea "${title}" sin cambios.`);
        }

        res.status(200).json({ message: "Tarea actualizada con éxito", task: updatedTask });
    } catch (error) {
        console.error("Error al actualizar la tarea:", error);
        res.status(500).json({ message: "Error al actualizar la tarea", error });
    }
});

// Eliminar una tarea (solo admin)
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si la tarea tiene dependencias
        const dependents = await Task.find({ dependencias: id });
        if (dependents.length > 0) {
            return res.status(400).json({
                message: 'La tarea no puede ser eliminada porque otras tareas dependen de ella.',
                dependents: dependents.map(task => ({
                    id: task._id,
                    title: task.title,
                })),
            });
        }

        // Eliminar la tarea
        const deletedTask = await Task.findByIdAndDelete(id);
        if (!deletedTask) {
            return res.status(404).json({ message: 'Tarea no encontrada.' });
        }

        // Registrar actividad en la bitácora
        await registrarActividad(req.user.id, 'Eliminación de tarea', `Se eliminó la tarea "${deletedTask.title}".`);

        res.status(200).json({ message: 'Tarea eliminada con éxito.' });
    } catch (error) {
        console.error('Error al eliminar la tarea:', error);
        res.status(500).json({ message: 'Error al eliminar la tarea.', error });
    }
});

// Función para detectar dependencias circulares
const hasCircularDependency = async (taskId, dependencias) => {
    const visited = new Set();

    const checkCycle = async (currentTaskId) => {
        if (visited.has(currentTaskId)) {
            return true; // Se ha encontrado un ciclo
        }
        visited.add(currentTaskId);

        const task = await Task.findById(currentTaskId);
        if (!task) return false;

        for (const dep of task.dependencias) {
            if (await checkCycle(dep.toString())) {
                return true;
            }
        }
        visited.delete(currentTaskId);
        return false;
    };

    for (const dep of dependencias) {
        if (await checkCycle(dep.toString())) {
            return true;
        }
    }

    return false;
};

module.exports = router;
