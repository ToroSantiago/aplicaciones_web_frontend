import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../auth/auth';
import './Success.css';

// Mismos helpers que en Failed.js: MP a veces manda "null" (string) en los
// query params, y los nombres varían (status / collection_status).
const STATUS_PARAMS = ['status', 'collection_status'];
const EMPTY_VALUES = new Set([null, undefined, '', 'null', 'undefined']);
const STATUS_LABEL = {
  approved: 'Aprobado',
  in_process: 'En proceso',
  pending: 'Pendiente',
  rejected: 'Rechazado',
};

const firstNonEmpty = (params, names) =>
  names.map((n) => params.get(n)).find((v) => !EMPTY_VALUES.has(v)) ?? null;

const Success = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Limpiar el carrito del usuario actual después de una compra exitosa.
    // La key ahora es por usuario (carrito_<id> o carrito_guest), no la
    // vieja 'carrito'.
    const user = getCurrentUser();
    const cartKey = user?.id ? `carrito_${user.id}` : 'carrito_guest';
    localStorage.removeItem(cartKey);
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }, []);

  const paymentId = firstNonEmpty(searchParams, ['payment_id', 'collection_id']);
  const rawStatus = firstNonEmpty(searchParams, STATUS_PARAMS);
  const statusLabel = rawStatus ? (STATUS_LABEL[rawStatus] ?? rawStatus) : 'Aprobado';

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

        {paymentId && (
          <div className="payment-details">
            <p><strong>ID de pago:</strong> {paymentId}</p>
            <p><strong>Estado:</strong> {statusLabel}</p>
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
