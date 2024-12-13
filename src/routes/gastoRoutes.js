// src/routes/gastoRoutes.js
const express = require('express');
const Gasto = require('../models/gastos');
const authenticate = require('../middleware/authenticate'); 
const authorize = require('../middleware/auth'); 
const router = express.Router();

router.post('/', authenticate, authorize(['admin', 'manager']), async (req, res) => {
    try {
        const { description, amount, category, date, project, doneBy } = req.body;

        if (!description || !amount || !project || !doneBy) {
            return res.status(400).json({ message: 'Descripción, monto, proyecto y nombre de la persona son obligatorios' });
        }

        const nuevoGasto = new Gasto({
            description,
            amount,
            category,
            date,
            project,
            addedBy: req.user.id,
            doneBy
        });

        const gastoGuardado = await nuevoGasto.save();
        res.status(201).json({ message: 'Gasto creado con éxito', gasto: gastoGuardado });
    } catch (error) {
        console.error('Error al crear el gasto:', error);
        res.status(500).json({ message: 'Error al crear el gasto', error });
    }
});

router.get('/project/:projectId', authenticate, authorize(['admin', 'manager', 'user']), async (req, res) => {
    try {
        const { projectId } = req.params;
        const gastos = await Gasto.find({ project: projectId }).populate('addedBy', 'username email');
        res.status(200).json(gastos);
    } catch (error) {
        console.error('Error al obtener los gastos:', error);
        res.status(500).json({ message: 'Error al obtener los gastos', error });
    }
});

router.put('/:id', authenticate, authorize(['admin', 'manager']), async (req, res) => {
    try {
        const { description, amount, category, date, doneBy } = req.body;

        const gastoActualizado = await Gasto.findByIdAndUpdate(
            req.params.id,
            { description, amount, category, date, doneBy },
            { new: true }
        );

        if (!gastoActualizado) {
            return res.status(404).json({ message: 'Gasto no encontrado' });
        }

        res.status(200).json({ message: 'Gasto actualizado con éxito', gasto: gastoActualizado });
    } catch (error) {
        console.error('Error al actualizar el gasto:', error);
        res.status(500).json({ message: 'Error al actualizar el gasto', error });
    }
});

router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const gastoEliminado = await Gasto.findByIdAndDelete(req.params.id);

        if (!gastoEliminado) {
            return res.status(404).json({ message: 'Gasto no encontrado' });
        }

        res.status(200).json({ message: 'Gasto eliminado con éxito' });
    } catch (error) {
        console.error('Error al eliminar el gasto:', error);
        res.status(500).json({ message: 'Error al eliminar el gasto', error });
    }
});

// Obtener un gasto específico por ID
router.get('/:id', authenticate, authorize(['admin', 'manager', 'user']), async (req, res) => {
    try {
        const gasto = await Gasto.findById(req.params.id).populate('addedBy', 'username email');
        if (!gasto) {
            return res.status(404).json({ message: 'Gasto no encontrado' });
        }
        res.status(200).json(gasto);
    } catch (error) {
        console.error('Error al obtener el gasto:', error);
        res.status(500).json({ message: 'Error al obtener el gasto', error });
    }
});

module.exports = router;
