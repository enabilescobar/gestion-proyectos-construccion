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
        enum: ['Pendiente', 'En Progreso', 'Completado', 'En Proceso'],
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
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);