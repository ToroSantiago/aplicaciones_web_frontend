import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertModal, useCustomModal } from '../Modal/modal';
import { API_BASE_URL, setSession } from '../auth/auth';
import { mergeGuestCartIntoUser } from '../Carrito/carrito';
import './authForms.css';

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { alertModal, showAlert, closeAlert } = useCustomModal();

  const togglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al iniciar sesión');
        return;
      }

      // El SPA es solo para Clientes. Empleados/Administradores tienen su
      // propio backoffice y se loguean por ahí. No guardamos token para no
      // mezclar contextos.
      if (data.usuario?.rol !== 'Cliente') {
        await showAlert(
          'Acceso restringido',
          'Esta cuenta es de empleado/administrador. Por favor, accedé al backoffice.'
        );
        return;
      }

      // Cliente: guardamos token + usuario y disparamos evento authChanged
      // para que el Navbar y el Carrito se actualicen.
      setSession(data.token, data.usuario);

      // Si el cliente tenía items en su carrito guest antes de loguearse,
      // los pasamos a su carrito personal así no los pierde.
      mergeGuestCartIntoUser();

      navigate('/home');
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // TODO: login con Google — la integración con Google OAuth/Sanctum
  // está sin implementar. Cuando se haga, agregar el botón y handler acá.

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

      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        onClose={closeAlert}
      />
    </div>
  );
};

export default LoginForm;