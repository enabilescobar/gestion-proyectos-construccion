import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
    
        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                // Guardar token en almacenamiento local
                localStorage.setItem('authToken', data.token);
                console.log('Inicio de sesión exitoso. Token almacenado:', data.token);
                // Redirigir al usuario
                window.location.href = '/home';
            } else {
                console.error('Error al iniciar sesión:', data.message);
                setError(data.message);
            }
        } catch (error) {
            console.error('Error al conectar con el servidor:', error);
            setError('Error al conectar con el servidor');
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#4169E1' }}>
            <div className="card p-4 shadow-sm" style={{ maxWidth: '400px', width: '100%' }}>
                <h1 className="text-center mb-4" style={{ fontSize: '2rem', color: '#007bff' }}>
                    CONSTRUCCIONES "GUARDADO"
                </h1>
                <h2 className="mb-4 text-center">Iniciar Sesión</h2>
                
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Correo Electrónico</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 py-2" style={{ fontSize: '1.2rem' }}>Entrar</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
