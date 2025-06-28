import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

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
      <h1>¡Pago Exitoso!</h1>
      <p>Tu compra se ha procesado correctamente.</p>
      <p>ID de pago: {searchParams.get('payment_id')}</p>
      <button onClick={() => navigate('/')}>Volver al inicio</button>
    </div>
  );
};

export default Success;