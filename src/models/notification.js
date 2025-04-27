// models/notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ['Project', 'Task'],
    required: true,
  },
  referenciaId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'tipo' // Referencia dinámica según el tipo
  },
  mensaje: {
    type: String,
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  leida: {
    type: Boolean,
    default: false
  },
  usuarioAsignado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // puede ser global si se deja sin asignar
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
