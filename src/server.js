require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 5000;

// Verificar la carpeta uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Carpeta uploads creada.');
}

// Configurar CORS
app.use(cors({
    origin: 'http://localhost:3000', // Cambia según el dominio del frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json());

// Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Importar rutas
const loginRoutes = require('./routes/loginRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const gastoRoutes = require('./routes/gastoRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Conectado a MongoDB'))
    .catch((error) => console.error('Error al conectar a MongoDB:', error));

// Rutas para las API
app.use('/api', loginRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/gastos', gastoRoutes);
app.use('/api/notifications', notificationRoutes);

// Ruta principal
app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente!');
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ message: err.message || 'Error en el servidor' });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    console.log(`Accede a los archivos estáticos en http://localhost:${PORT}/uploads`);
});
