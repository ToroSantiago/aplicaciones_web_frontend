import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './Success.css';

const Success = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Limpiar el carrito después de una compra exitosa
    localStorage.removeItem('carrito');
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }, []);

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M7 12L10 15L17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <h1 className="success-title">¡Pago Exitoso!</h1>
        <p className="success-message">
          Tu compra se ha procesado correctamente. Recibirás un correo con los detalles de tu pedido.
        </p>
        
        {searchParams.get('payment_id') && (
          <div className="payment-details">
            <p><strong>ID de pago:</strong> {searchParams.get('payment_id')}</p>
            <p><strong>Estado:</strong> {searchParams.get('status') || 'Aprobado'}</p>
          </div>
        )}
        
        <div className="success-actions">
          <button 
            className="btn-primary"
            onClick={() => navigate('/')}
          >
            Volver al Inicio
          </button>
          <button 
            className="btn-secondary"
            onClick={() => navigate('/home')}
          >
            Seguir Comprando
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;