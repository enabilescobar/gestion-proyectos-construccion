// src/models/projects.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    nombreProyecto: {type: String, required: true, trim: true},
    descripcion: {
        type: String,
        trim: true
    },
    fechaInicio: {
        type: Date,
        required: true
    },
    fechaFin: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Pendiente', 'En Progreso', 'Completado', 'En Proceso'],
        default: 'Pendiente'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);