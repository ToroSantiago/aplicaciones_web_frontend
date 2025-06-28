import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './authForms.css';

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const API_URL = "https://aplicacioneswebbackend-git-dev-torosantiagos-projects.vercel.app/edp";

  const togglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar el token y datos del usuario
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.usuario));
        
        // Redirigir según el rol
        if (data.usuario.rol === 'Administrador') {
          // Redirigir al panel de administración de Laravel
          window.location.href = 'https://aplicacioneswebbackend-git-dev-torosantiagos-projects.vercel.app/dashboard';
        } else {
          navigate('/home');
        }
      } else {
        setError(data.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
  };

  const handleRegister = () => {
    navigate('/register'); 
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Iniciar Sesión</h1>
          <p className="auth-description">Ingresa tus credenciales para acceder</p>
        </div>
        <div className="auth-content">
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-alert">
                {error}
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                className="form-input" 
                placeholder="usuario@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="password">Contraseña</label>
              <div className="password-container">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  id="password" 
                  className="form-input password-input" 
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={togglePassword}
                  disabled={loading}
                >
                  <span>{showPassword ? '🙈' : '👁️'}</span>
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="auth-switch">
            ¿No tienes una cuenta?{' '}
            <button 
              type="button" 
              className="link-btn" 
              onClick={handleRegister}
              disabled={loading}
            >
              Regístrate aquí
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;