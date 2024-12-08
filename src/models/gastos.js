// src/models/gastos.js
const mongoose = require('mongoose');

const gastoSchema = new mongoose.Schema({
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    category: {
        type: String,
        enum: ['Materiales', 'Herramientas', 'Combustible', 'Planilla', 'Logística', 'Otros'],
        default: 'Otros'
    },
    date: { type: Date, required: true, default: Date.now },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doneBy: { type: String, required: true, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Gasto', gastoSchema);
