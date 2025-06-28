import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Failed.css';

const Failed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  return (
    <div className="failed-container">
      <div className="failed-card">
        <div className="failed-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        
        <h1 className="failed-title">Pago No Completado</h1>
        <p className="failed-message">
          No se pudo procesar tu pago. No te preocupes, no se ha realizado ningún cargo.
        </p>
        
        {searchParams.get('status') && (
          <div className="payment-details">
            <p><strong>Estado:</strong> {searchParams.get('status')}</p>
          </div>
        )}
        
        <div className="failed-actions">
          <button 
            className="btn-primary"
            onClick={() => navigate('/')}
          >
            Volver al Carrito
          </button>
          <button 
            className="btn-secondary"
            onClick={() => navigate('/')}
          >
            Ir al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default Failed;