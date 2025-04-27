const express = require('express');
const Notification = require('../models/notification');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/auth');
const router = express.Router();
const { registrarActividad } = require('../controllers/bitacoraController');

// Obtener notificaciones del usuario autenticado
router.get('/', authenticate, async (req, res) => {
  try {
    const { role, id } = req.user;

    let filtro = {};
    
    if (role === 'admin' || role === 'manager') {
      // Admins y managers ven todas las notificaciones
      filtro = {};
    } else {
      // Otros usuarios solo ven las que les pertenecen
      filtro = {
        $or: [
          { usuarioAsignado: id },
          { usuarioAsignado: null }
        ]
      };
    }

    const notificaciones = await Notification.find(filtro)
    .sort({ fecha: -1 })
    .populate('referenciaId');
      
    res.status(200).json(notificaciones);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ message: 'Error al obtener notificaciones.' });
  }
});

// Marcar como leída
router.put('/:id/leida', authenticate, async (req, res) => {
  try {
    const noti = await Notification.findByIdAndUpdate(
      req.params.id,
      { leida: true },
      { new: true }
    ).populate('referenciaId');

    if (!noti) {
      return res.status(404).json({ message: 'Notificación no encontrada.' });
    }

    // Registro en bitácora
    const tipo = noti.tipo === 'Project' ? 'Proyecto' : 'Tarea';
    const nombre = noti.referenciaId?.nombreProyecto || noti.referenciaId?.title || 'desconocido';
    await registrarActividad(req.user.id, 'Atendió Notificación', `Atendió notificación de ${tipo} "${nombre}"`);

    res.status(200).json({ message: 'Notificación marcada como leída.', noti });
  } catch (error) {
    console.error('Error al marcar notificación:', error);
    res.status(500).json({ message: 'Error al actualizar notificación.' });
  }
});

const generarNotificacionesRetraso = require('../utils/notificaciones');

// Eliminar todas las notificaciones que ya han sido atendidas
router.delete('/atendidas', authenticate, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const resultado = await Notification.deleteMany({ leida: true });

    await registrarActividad(req.user.id, 'Eliminó Notificaciones Atendidas', `Eliminó ${resultado.deletedCount} notificaciones atendidas`);

    res.status(200).json({
      message: `${resultado.deletedCount} notificaciones eliminadas.`
    });
  } catch (error) {
    console.error('Error al eliminar notificaciones atendidas:', error);
    res.status(500).json({ message: 'Error al eliminar notificaciones.' });
  }
});

// Eliminar una notificación específica (solo para admin/manager)
router.delete('/:id', authenticate, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const noti = await Notification.findByIdAndDelete(req.params.id).populate('referenciaId');
    if (!noti) {
      return res.status(404).json({ message: 'Notificación no encontrada.' });
    }

    const tipo = noti.tipo === 'Project' ? 'Proyecto' : 'Tarea';
    const nombre = noti.referenciaId?.nombreProyecto || noti.referenciaId?.title || 'desconocido';
    await registrarActividad(req.user.id, 'Eliminó Notificación', `Eliminó notificación de ${tipo} "${nombre}"`);

    res.status(200).json({ message: 'Notificación eliminada.' });
  } catch (error) {
    console.error('Error al eliminar la notificación:', error);
    res.status(500).json({ message: 'Error al eliminar notificación.' });
  }
});

// Ruta temporal para generar notificaciones manualmente
router.get('/generar', authenticate, authorize(['admin', 'manager']), async (req, res) => {
    try {
        await generarNotificacionesRetraso();
        res.status(200).json({ message: 'Notificaciones generadas con éxito.' });
    } catch (error) {
        console.error('Error al generar notificaciones:', error);
        res.status(500).json({ message: 'Error al generar notificaciones.' });
    }
});

module.exports = router;
