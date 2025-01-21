const express = require('express');
const mongoose = require('mongoose');
const Project = require('../models/projects');
const Task = require('../models/tasks'); 
const Gasto = require('../models/gastos'); 
const authorize = require('../middleware/auth');
const authenticate = require('../middleware/authenticate'); 
const router = express.Router();

/**
 * Método para calcular y actualizar el avance de un proyecto
 */
const calculateProjectProgress = async (projectId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            console.error(`ID de proyecto inválido: ${projectId}`);
            return;
        }

        const totalTasks = await Task.countDocuments({ project: projectId });
        const completedTasks = await Task.countDocuments({ project: projectId, status: 'Completado' });

        console.log(`Total de tareas: ${totalTasks}, Tareas completadas: ${completedTasks}`);

        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const updatedProject = await Project.findByIdAndUpdate(projectId, { avance: progress }, { new: true });

        if (!updatedProject) {
            console.error(`No se encontró el proyecto con ID: ${projectId}`);
            return;
        }

        console.log(`Avance actualizado en la BD: ${progress}%`);
    } catch (error) {
        console.error(`Error al calcular el avance del proyecto ${projectId}:`, error);
    }
};

/**
 * Crear un nuevo proyecto
 */
router.post('/', authenticate, authorize(['admin', 'manager']), async (req, res) => {
    try {
        const { nombreProyecto, descripcion, fechaInicio, fechaFin, presupuesto, encargado, equipoTrabajo } = req.body;

        // Validar los datos recibidos
        if (!nombreProyecto || !fechaInicio || !presupuesto || !encargado) {
            return res.status(400).json({ message: 'Nombre del proyecto, fecha de inicio, presupuesto y encargado son obligatorios' });
        }

        // Validar que el encargado sea un manager
        const manager = await mongoose.model('User').findById(encargado);
        if (!manager || manager.role !== 'manager') {
            return res.status(400).json({ message: 'El encargado debe ser un usuario con rol de "manager".' });
        }

        // Crear el proyecto
        const createdBy = req.user.id; // Usuario autenticado

        const newProject = new Project({
            nombreProyecto,
            descripcion,
            presupuesto,
            fechaInicio,
            fechaFin,
            status: 'Pendiente', 
            encargado,
            equipoTrabajo,
            createdBy,
        });

        const savedProject = await newProject.save();
        res.status(201).json({ message: 'Proyecto creado con éxito', project: savedProject });
    } catch (error) {
        console.error('Error al crear el proyecto:', error);
        res.status(500).json({ message: 'Error al crear el proyecto', error });
    }
});

/**
 * Obtener todos los proyectos
 */
router.get('/', authenticate, authorize(['admin', 'manager', 'user']), async (req, res) => {
    try {
        const { status, createdBy } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (createdBy) filter.createdBy = createdBy;

        const projects = await Project.find(filter).populate('createdBy', 'username email');
        res.status(200).json(projects);
    } catch (error) {
        console.error('Error al obtener proyectos:', error);
        res.status(500).json({ message: 'Error al obtener proyectos', error });
    }
});

/**
 * Actualizar un proyecto
 */
router.put('/:id', authenticate, authorize(['admin', 'manager']), async (req, res) => {
    try {
        const { nombreProyecto, descripcion, fechaInicio, fechaFin, status, presupuesto, equipoTrabajo } = req.body;

        if (!nombreProyecto || !fechaInicio || !presupuesto || !equipoTrabajo) {
            return res.status(400).json({ message: 'Nombre del proyecto, fecha de inicio, presupuesto y equipo de trabajo son obligatorios' });
        }

        if (fechaFin && new Date(fechaInicio) >= new Date(fechaFin)) {
            return res.status(400).json({ message: 'La fecha de inicio debe ser anterior a la fecha de fin.' });
        }

        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            { nombreProyecto, descripcion, fechaInicio, fechaFin, status, presupuesto, equipoTrabajo },
            { new: true }
        );

        if (!updatedProject) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        res.status(200).json({ message: 'Proyecto actualizado con éxito', project: updatedProject });
    } catch (error) {
        console.error('Error al actualizar el proyecto:', error);
        res.status(400).json({ message: 'Error al actualizar el proyecto', error });
    }
});

/**
 * Actualizar el estado de una tarea y el avance del proyecto
 */
router.put('/tareas/:taskId', authenticate, authorize(['admin', 'manager']), async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;

        const task = await Task.findByIdAndUpdate(taskId, { status }, { new: true });
        if (!task) {
            return res.status(404).json({ message: 'Tarea no encontrada.' });
        }

        await calculateProjectProgress(task.project); // Recalcular avance del proyecto

        res.status(200).json({ message: 'Estado de tarea actualizado y avance recalculado.', task });
    } catch (error) {
        console.error('Error al actualizar la tarea:', error);
        res.status(500).json({ message: 'Error al actualizar la tarea.', error });
    }
});

/**
 * Ruta para recalcular manualmente el avance del proyecto
 */
router.put('/:id/avance', authenticate, authorize(['admin', 'manager']), async (req, res) => {
    try {
        const { id } = req.params;

        await calculateProjectProgress(id);

        const updatedProject = await Project.findById(id);
        res.status(200).json({ message: 'Avance del proyecto recalculado.', project: updatedProject });
    } catch (error) {
        console.error('Error al recalcular el avance del proyecto:', error);
        res.status(500).json({ message: 'Error al recalcular el avance del proyecto.', error });
    }
});

/**
 * Eliminar un proyecto y sus tareas relacionadas
 */
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const projectId = req.params.id;

        await Task.deleteMany({ project: projectId });
        await Gasto.deleteMany({ project: projectId });

        const deletedProject = await Project.findByIdAndDelete(projectId);
        if (!deletedProject) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        res.status(200).json({ message: 'Proyecto, tareas y gastos relacionados eliminados con éxito' });
    } catch (error) {
        console.error('Error al eliminar el proyecto:', error);
        res.status(500).json({ message: 'Error al eliminar el proyecto', error });
    }
});

// Obtener el avance de los proyectos
router.get('/avance', authenticate, authorize(['admin', 'manager', 'user']), async (req, res) => {
    try {
        const projects = await Project.find({}, 'nombreProyecto avance status');
        res.status(200).json(projects);
    } catch (error) {
        console.error('Error al obtener el avance de los proyectos:', error);
        res.status(500).json({ message: 'Error al obtener el avance', error });
    }
});

// Obtener el presupuesto de los proyectos
router.get('/presupuesto', authenticate, authorize(['admin', 'manager']), async (req, res) => {
    try {
        const projects = await Project.find({}, 'nombreProyecto presupuesto status');

        const gastos = await Gasto.aggregate([
            { 
                $group: { 
                    _id: '$project', 
                    totalGasto: { $sum: '$amount' } 
                } 
            }
        ]);

        console.log('Gastos agregados:', gastos);

        const response = projects.map(project => {
            const gasto = gastos.find(g => String(g._id) === String(project._id)) || { totalGasto: 0 };
            return {
                nombreProyecto: project.nombreProyecto,
                presupuesto: project.presupuesto || 0,
                utilizado: gasto.totalGasto || 0,
                restante: (project.presupuesto || 0) - (gasto.totalGasto || 0),
                status: project.status
            };
        });
        
        res.status(200).json(response);
    } catch (error) {
        console.error('Error al obtener el presupuesto de los proyectos:', error);
        res.status(500).json({ message: 'Error al obtener el presupuesto', error });
    }
});

// Obtener fechas importantes de los proyectos
router.get('/fechas', authenticate, authorize(['admin', 'manager', 'user']), async (req, res) => {
    try {
        const projects = await Project.find({}, 'nombreProyecto fechaInicio fechaFin');
        const fechas = projects.map(proyecto => ({
            id: proyecto._id,
            titulo: proyecto.nombreProyecto,
            fechaInicio: proyecto.fechaInicio,
            fechaFin: proyecto.fechaFin
        }));

        res.status(200).json(fechas);
    } catch (error) {
        console.error('Error al obtener las fechas de los proyectos:', error);
        res.status(500).json({ message: 'Error al obtener las fechas', error });
    }
});

// Obtener un proyecto por ID (debe ir después)
router.get('/:id', authenticate, authorize(['admin', 'manager', 'user']), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('createdBy', 'username email');
        if (!project) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }
        res.status(200).json(project);
    } catch (error) {
        console.error('Error al obtener el proyecto:', error);
        res.status(500).json({ message: 'Error al obtener el proyecto', error });
    }
});

module.exports = router;
