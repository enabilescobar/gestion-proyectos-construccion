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

// Campo virtual para determinar si la tarea está bloqueada
taskSchema.virtual('isBlocked').get(function () {
    // La tarea está bloqueada si tiene dependencias y alguna no está en estado "Completado"
    if (this.dependencias && this.dependencias.length > 0) {
        return this.dependencias.some(dep => dep.status !== 'Completado');
    }
    return false;
});

// Incluir los campos virtuales en la salida JSON
taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema);
