import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertModal, useCustomModal } from '../Modal/modal';
import { API_BASE_URL, setSession } from '../auth/auth';
import { mergeGuestCartIntoUser } from '../Carrito/carrito';
import './registerForm.css';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // Modales propios (reemplaza los alert() nativos del registro).
  const { alertModal, showAlert, closeAlert } = useCustomModal();

  const navigate = useNavigate();
  // API_URL ahora viene del helper de auth (centralizado, lee de
  // REACT_APP_API_URL en build time).
  const API_URL = API_BASE_URL;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
      newErrors.password = 'La contraseña debe contener mayúsculas, minúsculas, números y símbolos';
    }
    
    if (!formData.password_confirmation) {
      newErrors.password_confirmation = 'Por favor confirma tu contraseña';
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Las contraseñas no coinciden';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar sesión vía helper centralizado (dispara authChanged
        // para que el Navbar muestre al usuario logueado).
        setSession(data.token, data.usuario);

        // Si el visitante había agregado cosas al carrito antes de registrarse,
        // se las pasamos a su nuevo carrito personal.
        mergeGuestCartIntoUser();

        await showAlert('¡Registro exitoso!', 'Bienvenido a nuestra tienda de perfumes.');
        navigate('/home');
      } else {
        // Errores de validación del servidor → se muestran inline en cada campo.
        // El resto va por modal.
        if (data.errors) {
          setErrors(data.errors);
        } else if (data.message) {
          await showAlert('No se pudo registrar', data.message);
        } else {
          await showAlert('No se pudo registrar', 'Error en el registro. Por favor intentá de nuevo.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      await showAlert('Error de conexión', 'Por favor verificá tu conexión a internet.');
    } finally {
      setLoading(false);
    }
  };

  const togglePassword = () => setShowPassword(!showPassword);
  const togglePasswordConfirm = () => setShowPasswordConfirm(!showPasswordConfirm);

  const handleLogin = () => {
    navigate('/authForm');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Crear Cuenta</h1>
          <p className="auth-description">Regístrate para comprar los mejores perfumes</p>
        </div>
        
        <div className="auth-content">
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="nombre">Nombre</label>
                <input 
                  type="text" 
                  id="nombre" 
                  name="nombre"
                  className={`form-input ${errors.nombre ? 'error' : ''}`}
                  placeholder="Tu nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.nombre && <span className="error-message">{errors.nombre}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="apellido">Apellido</label>
                <input 
                  type="text" 
                  id="apellido" 
                  name="apellido"
                  className={`form-input ${errors.apellido ? 'error' : ''}`}
                  placeholder="Tu apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.apellido && <span className="error-message">{errors.apellido}</span>}
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="email">Correo Electrónico</label>
              <input 
                type="email" 
                id="email" 
                name="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="usuario@ejemplo.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="password">Contraseña</label>
              <div className="password-container">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  id="password" 
                  name="password"
                  className={`form-input password-input ${errors.password ? 'error' : ''}`}
                  placeholder="Mínimo 8 caracteres"
                  value={formData.password}
                  onChange={handleChange}
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
              {errors.password && <span className="error-message">{errors.password}</span>}
              <small className="form-hint">
                Debe contener mayúsculas, minúsculas, números y símbolos
              </small>
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="password_confirmation">Confirmar Contraseña</label>
              <div className="password-container">
                <input 
                  type={showPasswordConfirm ? 'text' : 'password'}
                  id="password_confirmation" 
                  name="password_confirmation"
                  className={`form-input password-input ${errors.password_confirmation ? 'error' : ''}`}
                  placeholder="Repite tu contraseña"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={togglePasswordConfirm}
                  disabled={loading}
                >
                  <span>{showPasswordConfirm ? '🙈' : '👁️'}</span>
                </button>
              </div>
              {errors.password_confirmation && <span className="error-message">{errors.password_confirmation}</span>}
            </div>
            
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={loading}
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>
          
          <div className="auth-switch">
            ¿Ya tienes una cuenta?{' '} 
            <button 
              type="button" 
              className="link-btn" 
              onClick={handleLogin}
              disabled={loading}
            >
              Inicia sesión aquí
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

export default RegisterForm;