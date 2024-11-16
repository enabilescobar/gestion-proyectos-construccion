import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/login';
import Home from './components/Home';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Ruta para la pantalla de login */}
          <Route path="/login" element={<Login />} />

          {/* Ruta para la pantalla de Home */}
          <Route path="/home" element={<Home />} />

          {/* Redirección a la página de login por defecto si la ruta no coincide */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
