const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Gasto = require('../models/gastos');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/auth');
const router = express.Router();

// Configuración de Multer para la subida de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            const projectId = req.body.project || req.projectId; // Usamos el ID validado
            if (!projectId) {
                console.error('El ID del proyecto no fue proporcionado.');
                return cb(new Error('El ID del proyecto es requerido para subir archivos.'));
            }
            const dir = path.join(__dirname, '..', 'uploads', 'projects', projectId, 'facturas');
            fs.mkdirSync(dir, { recursive: true }); // Crea las carpetas si no existen
            cb(null, dir);
        } catch (error) {
            console.error('Error en Multer al determinar el destino:', error);
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        try {
            if (!file.originalname) {
                console.error('El archivo no tiene un nombre válido.');
                return cb(new Error('El archivo no tiene un nombre válido.'));
            }
            cb(null, `${Date.now()}-${file.originalname}`);
        } catch (error) {
            console.error('Error en Multer al asignar el nombre del archivo:', error);
            cb(error);
        }
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.mimetype)) {
            console.error('Tipo de archivo no permitido:', file.mimetype);
            return cb(new Error('Tipo de archivo no permitido.'));
        }
        cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5 MB
});

// Middleware para validar el ID del proyecto antes de usar Multer
const validateProjectId = (req, res, next) => {
    const projectId = req.body.project || req.params.projectId;
    if (!projectId) {
        console.error('El ID del proyecto es requerido pero no fue proporcionado.');
        return res.status(400).json({ message: 'El ID del proyecto es requerido.' });
    }
    req.projectId = projectId; // Asignar el ID del proyecto a la solicitud
    next();
};

// Crear un nuevo gasto con archivos adjuntos
router.post('/', authenticate, authorize(['admin', 'manager']), upload.array('facturas', 5), async (req, res) => {
    try {
        // Depuración: Imprime el cuerpo y los archivos recibidos
        console.log('Datos recibidos en req.body:', req.body);
        console.log('Archivos recibidos en req.files:', req.files);

        const { description, amount, category, date, project, doneBy } = req.body;

        // Validar datos obligatorios
        if (!description || !amount || !project || !doneBy) {
            return res.status(400).json({ 
                message: 'Descripción, monto, proyecto y nombre de la persona son obligatorios' 
            });
        }

        // Procesar archivos subidos
        const facturas = req.files
            ? req.files.map(file => ({
                  nombre: file.originalname,
                  ruta: path.relative(path.join(__dirname, '..'), file.path),
              }))
            : [];

        // Crear un nuevo gasto
        const nuevoGasto = new Gasto({
            description,
            amount,
            category,
            date,
            project,
            addedBy: req.user.id,
            doneBy,
            facturas,
        });

        const gastoGuardado = await nuevoGasto.save();

        // Responder con éxito
        res.status(201).json({ message: 'Gasto creado con éxito', gasto: gastoGuardado });
    } catch (error) {
        console.error('Error al crear el gasto:', error.message);
        res.status(500).json({ message: 'Error al crear el gasto', error: error.message });
    }
});

// Actualizar un gasto con nuevos archivos adjuntos
router.put('/:id', authenticate, authorize(['admin', 'manager']), upload.array('facturas', 5), async (req, res) => {
    try {
        const { description, amount, category, date, doneBy, project, deleteFacturas } = req.body;

        if (!project) {
            return res.status(400).json({ message: 'El ID del proyecto es requerido.' });
        }

        const gasto = await Gasto.findById(req.params.id);
        if (!gasto) {
            return res.status(404).json({ message: 'Gasto no encontrado' });
        }

        if (deleteFacturas) {
            deleteFacturas.forEach(facturaId => {
                const factura = gasto.facturas.id(facturaId);
                if (factura) {
                    const filePath = path.join(__dirname, '..', factura.ruta);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                    factura.remove();
                }
            });
        }

        const nuevasFacturas = req.files.map(file => ({
            nombre: file.originalname,
            ruta: path.relative(path.join(__dirname, '..'), file.path)
        }));

        gasto.description = description;
        gasto.amount = amount;
        gasto.category = category;
        gasto.date = date;
        gasto.doneBy = doneBy;
        gasto.project = project;
        gasto.facturas.push(...nuevasFacturas);

        const gastoActualizado = await gasto.save();
        res.status(200).json({ message: 'Gasto actualizado con éxito', gasto: gastoActualizado });
    } catch (error) {
        console.error('Error al actualizar el gasto:', error);
        res.status(500).json({ message: 'Error al actualizar el gasto', error: error.message });
    }
});

// Eliminar un gasto y sus archivos adjuntos
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const gasto = await Gasto.findById(req.params.id);

        if (!gasto) {
            return res.status(404).json({ message: 'Gasto no encontrado' });
        }

        // Eliminar archivos asociados al gasto
        gasto.facturas.forEach(factura => {
            const filePath = path.join(__dirname, '..', factura.ruta);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); // Eliminar archivo del servidor
            }
        });

        // Eliminar el gasto usando findByIdAndDelete
        await Gasto.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Gasto eliminado con éxito' });
    } catch (error) {
        console.error('Error al eliminar el gasto:', error);
        res.status(500).json({ message: 'Error al eliminar el gasto', error: error.message });
    }
});

// Eliminar una factura específica
router.delete('/facturas/:facturaId', authenticate, authorize(['admin', 'manager']), async (req, res) => {
    const { facturaId } = req.params;

    try {
        // Buscar el gasto que contiene la factura
        const gasto = await Gasto.findOne({ 'facturas._id': facturaId });

        if (!gasto) {
            return res.status(404).json({ message: 'Factura no encontrada' });
        }

        // Encontrar la factura dentro del gasto
        const factura = gasto.facturas.find(f => f._id.toString() === facturaId);

        // Eliminar el archivo físicamente del servidor
        const filePath = path.join(__dirname, '..', factura.ruta);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Eliminar la factura de la base de datos
        gasto.facturas = gasto.facturas.filter(f => f._id.toString() !== facturaId);
        await gasto.save();

        res.status(200).json({ message: 'Factura eliminada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar la factura' });
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
        res.status(500).json({ message: 'Error al obtener el gasto', error: error.message });
    }
});

// Obtener gastos de un proyecto
router.get('/project/:projectId', authenticate, authorize(['admin', 'manager', 'user']), async (req, res) => {
    try {
        const { projectId } = req.params;
        const gastos = await Gasto.find({ project: projectId }).populate('addedBy', 'username email');
        res.status(200).json(gastos);
    } catch (error) {
        console.error('Error al obtener los gastos:', error);
        res.status(500).json({ message: 'Error al obtener los gastos', error: error.message });
    }
});

module.exports = router;
