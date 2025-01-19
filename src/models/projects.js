// src/models/projects.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    nombreProyecto: { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true },
    presupuesto: { type: Number, required: true },
    fechaInicio: { type: Date, required: true },
    fechaFin: { type: Date },
    status: { 
        type: String, 
        enum: ['Pendiente', 'Completado', 'En Proceso', 'Suspendido', 'Cancelado'], 
        default: 'Pendiente' 
    },
    encargado: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        validate: {
            validator: async function(value) {
                const user = await mongoose.model('User').findById(value);
                return user && user.role === 'manager';
            },
            message: 'El encargado debe ser un usuario con rol de "manager".'
        }
    },
    equipoTrabajo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    avance: { type: Number, default: 0 }, // Nuevo campo: porcentaje de avance
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
