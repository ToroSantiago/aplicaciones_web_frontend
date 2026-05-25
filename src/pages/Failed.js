import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Failed.css';

// MercadoPago manda el resultado del pago en distintos query params según
// el flujo (status, collection_status, etc). A veces el valor literal es
// "null" (string) cuando el usuario aborta el checkout, así que lo tratamos
// como ausente.
const STATUS_PARAMS = ['status', 'collection_status'];
const EMPTY_VALUES = new Set([null, undefined, '', 'null', 'undefined']);

// Etiquetas humanas para los estados que típicamente devuelve MP.
const STATUS_LABEL = {
  rejected: 'Rechazado por el medio de pago',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
  in_process: 'En proceso',
  pending: 'Pendiente',
  approved: 'Aprobado',
};

const Failed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Tomamos el primer status no vacío entre los params posibles.
  const rawStatus = STATUS_PARAMS
    .map((p) => searchParams.get(p))
    .find((v) => !EMPTY_VALUES.has(v));

  const statusLabel = rawStatus ? (STATUS_LABEL[rawStatus] ?? rawStatus) : null;

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

        {statusLabel && (
          <div className="payment-details">
            <p><strong>Estado:</strong> {statusLabel}</p>
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
