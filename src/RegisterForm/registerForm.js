import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './registerForm.css';

const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const togglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Register attempt:', { email, password });
    alert('Registro exitoso! (Esta es solo una demostración)');
  };

  const handleGoogleRegister = () => {
    console.log('Google register clicked');
  };

  const handleLogin = () => {
    navigate('/authForm');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Crear Cuenta</h1>
          <p className="auth-description">Ingresa tus datos para registrarte</p>
        </div>
        <div className="auth-content">
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Correo Electrónico</label>
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
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={togglePassword}
                >
                  <span>{showPassword ? '🙈' : '👁️'}</span>
                </button>
              </div>
            </div>
            
            <button type="submit" className="submit-btn">Crear Cuenta</button>
          </form>
          
          <div className="auth-switch">
            ¿Ya tienes una cuenta?{' '} 
            <button type="button" className="link-btn" onClick={handleLogin}>
              Inicia sesión aquí
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
