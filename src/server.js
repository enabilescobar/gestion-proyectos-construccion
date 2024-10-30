const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;

app.use(express.json());

const userRoutes = require('./routes/userRoutes');

// Conexión a MongoDB Atlas
const MONGODB_URI = 'mongodb+srv://enabilescobar:Naxildo2099@cluster0.syzoc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Conectar a la base de datos MongoDB
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Conectado a MongoDB'))
    .catch((error) => console.error('Error al conectar a MongoDB:', error));

app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente!');
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

