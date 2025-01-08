const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Schema para almacenar los archivos de las facturas
const facturaSchema = new mongoose.Schema({
    nombre: { type: String, required: true }, // Nombre del archivo
    ruta: { type: String, required: true },   // Ruta del archivo en el servidor
}, { _id: false }); // Evitar que se genere un `_id` adicional para cada factura

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
    doneBy: { type: String, required: true, trim: true },
    facturas: [facturaSchema], // Relacionamos las facturas con el gasto
}, { timestamps: true });

// Middleware para eliminar archivos de facturas relacionados al eliminar un gasto
gastoSchema.pre('remove', function (next) {
    if (this.facturas && this.facturas.length > 0) {
        this.facturas.forEach(factura => {
            const filePath = path.join(__dirname, '..', factura.ruta);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); // Eliminar archivo físicamente del servidor
            }
        });
    }
    next();
});

module.exports = mongoose.model('Gasto', gastoSchema);
