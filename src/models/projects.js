const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    nombreProyecto: { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true },
    fechaInicio: { type: Date, required: true },
    fechaFin: { type: Date },
    status: { 
        type: String, 
        enum: ['Pendiente', 'En Progreso', 'Completado', 'En Proceso'], 
        default: 'Pendiente' 
    },
    presupuesto: { type: Number, required: true },
    encargado: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, // El encargado es obligatorio
        validate: {
            validator: async function(value) {
                const user = await mongoose.model('User').findById(value);
                return user && user.role === 'manager'; // Aseguramos que el encargado sea un 'manager'
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
    }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
