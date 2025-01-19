// src/models/tasks.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Pendiente', 'Completado', 'En Proceso', 'Suspendido', 'Cancelado'],
        default: 'Pendiente'
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    startDate: { 
        type: Date 
    },
    endDate: { 
        type: Date 
    },
    dependencias: [{ // Campo agregado para manejar dependencias
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
