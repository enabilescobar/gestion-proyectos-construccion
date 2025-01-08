const express = require('express');
const mongoose = require('mongoose');
const Project = require('../models/projects');
const Task = require('../models/tasks'); 
const Gasto = require('../models/gastos'); 
const authorize = require('../middleware/auth');
const authenticate = require('../middleware/authenticate'); 
const router = express.Router();

// Crear un nuevo proyecto
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
            fechaInicio,
            fechaFin,
            status: 'Pendiente', 
            presupuesto,
            encargado, // El encargado es el manager
            equipoTrabajo, // El equipo de trabajo puede estar vacío
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
router.get('/', authenticate, authorize(['admin', 'manager', 'user']), async (req, res) => {
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

// Actualizar un proyecto
router.put('/:id', authenticate, authorize(['admin', 'manager']), async (req, res) => {
    try {
        const { nombreProyecto, descripcion, fechaInicio, fechaFin, status, presupuesto, equipoTrabajo } = req.body;

        // Validar los datos recibidos
        if (!nombreProyecto || !fechaInicio || !presupuesto || !equipoTrabajo) {
            return res.status(400).json({ message: 'Nombre del proyecto, fecha de inicio, presupuesto y equipo de trabajo son obligatorios' });
        }

        // Validar que la fecha de inicio sea anterior a la fecha de fin
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
