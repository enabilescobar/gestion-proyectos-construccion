// src/routes/projectRoutes.js
const express = require('express');
const Project = require('../models/projects');
const Task = require('../models/tasks'); 
const Gasto = require('../models/gastos'); 
const authorize = require('../middleware/auth');
const authenticate = require('../middleware/authenticate'); 
const router = express.Router();


// Crear un nuevo proyecto
router.post('/', authenticate, authorize(['admin', 'manager']), async (req, res) => {
    try {
        const { nombreProyecto, descripcion, fechaInicio, fechaFin } = req.body;

        // Validar los datos recibidos
        if (!nombreProyecto || !fechaInicio) {
            return res.status(400).json({ message: 'Nombre del proyecto y fecha de inicio son obligatorios' });
        }

        const createdBy = req.user.id; // Usuario autenticado

        const newProject = new Project({
            nombreProyecto,
            descripcion,
            fechaInicio,
            fechaFin,
            status: 'Pendiente', 
            createdBy,
        });

        const savedProject = await newProject.save();
        res.status(201).json({ message: 'Proyecto creado con éxito', project: savedProject });
    } catch (error) {
        console.error('Error al crear el proyecto:', error);
        res.status(500).json({ message: 'Error al crear el proyecto', error });
    }
});

// Obtener todos los proyectos
router.get('/', authenticate, authorize(['admin', 'manager']), async (req, res) => {
    try {
        const { status, createdBy } = req.query;

        // Construir el filtro dinámico en el futuro
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

// Obtener un proyecto por ID
router.get('/:id', authenticate, authorize(['admin', 'manager']), async (req, res) => {
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

// Actualizar un proyecto
router.put('/:id', authenticate, authorize(['admin', 'manager']), async (req, res) => {
    try {
        const { nombreProyecto, descripcion, fechaInicio, fechaFin, status } = req.body;

        // Validar los datos recibidos
        if (!nombreProyecto || !fechaInicio) {
            return res.status(400).json({ message: 'Nombre del proyecto y fecha de inicio son obligatorios' });
        }

        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            { nombreProyecto, descripcion, fechaInicio, fechaFin, status },
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

// Eliminar un proyecto y sus tareas relacionadas
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const projectId = req.params.id;

        // Eliminar todas las tareas relacionadas con el proyecto
        await Task.deleteMany({ project: projectId });

        // Eliminar todos los gastos relacionados con el proyecto
        await Gasto.deleteMany({ project: projectId });

        // Eliminar el proyecto
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

module.exports = router;
