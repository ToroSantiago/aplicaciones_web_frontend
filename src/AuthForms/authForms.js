import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './authForms.css';

const LoginForm = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
    alert('Formulario enviado! (Esta es solo una demostración)');
    navigate('/home');
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
                />
                <button type="button" className="password-toggle" onClick={togglePassword}>
                  <span>{showPassword ? '🙈' : '👁️'}</span>
                </button>
              </div>
            </div>
            <button type="submit" className="submit-btn">Iniciar Sesión</button>
          </form>

          <div className="divider">
            <span className="divider-text">O continúa con</span>
          </div>

          <button type="button" className="google-btn" onClick={handleGoogleLogin}>
            <span className="google-icon">✉️</span>
            Iniciar sesión con Google
          </button>

          <div className="auth-switch">
            ¿No tienes una cuenta?{' '}
            <button type="button" className="link-btn" onClick={handleRegister}>
              Regístrate aquí
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
