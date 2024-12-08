// src/server.js
require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const loginRoutes = require('./routes/loginRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const gastoRoutes = require('./routes/gastoRoutes');

// Conexión a MongoDB Atlas
const MONGODB_URI = 'mongodb+srv://enabilescobar:Naxildo2099@cluster0.syzoc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Conectar a la base de datos MongoDB
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Conectado a MongoDB'))
    .catch((error) => console.error('Error al conectar a MongoDB:', error));

app.use('/api', loginRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/gastos', gastoRoutes);

app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente!');
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});