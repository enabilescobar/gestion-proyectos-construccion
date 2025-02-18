const Bitacora = require('../models/bitacora');

const registrarActividad = async (usuarioId, accion, descripcion) => {
  try {
    console.log(`Registrando actividad: Usuario: ${usuarioId}, Acción: ${accion}, Descripción: ${descripcion}`);
    await Bitacora.create({
      usuario: usuarioId,
      accion,
      descripcion
    });
  } catch (error) {
    console.error('Error al registrar actividad en bitácora:', error);
  }
};

module.exports = { registrarActividad };
