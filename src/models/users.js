const mongoose = require('mongoose');

// Esquema de usuario
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

// Modelo de usuario
const User = mongoose.model('User', userSchema);

module.exports = User;
