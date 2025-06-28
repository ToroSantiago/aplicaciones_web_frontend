import React from 'react';
import { useNavigate } from 'react-router-dom';

const Failed = () => {
  const navigate = useNavigate();

  return (
    <div className="failed-container">
      <h1>Pago No Completado</h1>
      <p>No se pudo procesar tu pago. Por favor, intenta nuevamente.</p>
      <button onClick={() => navigate('/carrito')}>Volver al carrito</button>
    </div>
  );
};

export default Failed;