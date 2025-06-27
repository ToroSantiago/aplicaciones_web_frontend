"use client"

import { useState } from "react"
import "./modal.css"

// Modal de confirmación personalizado
export const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null

  return (
    <div className="custom-modal-overlay" onClick={onCancel}>
      <div className="custom-modal confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="custom-modal-header">
          <h3 className="custom-modal-title">{title}</h3>
        </div>
        <div className="custom-modal-content">
          <p className="custom-modal-message">{message}</p>
        </div>
        <div className="custom-modal-actions">
          <button className="custom-modal-btn cancel-btn" onClick={onCancel}>
            Cancelar
          </button>
          <button className="custom-modal-btn confirm-btn" onClick={onConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

// Modal de alerta personalizado
export const AlertModal = ({ isOpen, title, message, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="custom-modal-overlay" onClick={onClose}>
      <div className="custom-modal alert-modal" onClick={(e) => e.stopPropagation()}>
        <div className="custom-modal-header">
          <h3 className="custom-modal-title">{title}</h3>
        </div>
        <div className="custom-modal-content">
          <div className="custom-modal-icon">✅</div>
          <p className="custom-modal-message">{message}</p>
        </div>
        <div className="custom-modal-actions">
          <button className="custom-modal-btn confirm-btn" onClick={onClose}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook personalizado para manejar modales
export const useCustomModal = () => {
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    onCancel: null,
  })

  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  })

  const showConfirm = (title, message) => {
    return new Promise((resolve) => {
      setConfirmModal({
        isOpen: true,
        title,
        message,
        onConfirm: () => {
          setConfirmModal({ ...confirmModal, isOpen: false })
          resolve(true)
        },
        onCancel: () => {
          setConfirmModal({ ...confirmModal, isOpen: false })
          resolve(false)
        },
      })
    })
  }

  const showAlert = (title, message) => {
    return new Promise((resolve) => {
      setAlertModal({
        isOpen: true,
        title,
        message,
      })

      const closeAlert = () => {
        setAlertModal({ ...alertModal, isOpen: false })
        resolve()
      }

      // Auto-cerrar después de 3 segundos
      setTimeout(closeAlert, 3000)
    })
  }

  const closeAlert = () => {
    setAlertModal({ ...alertModal, isOpen: false })
  }

  return {
    confirmModal,
    alertModal,
    showConfirm,
    showAlert,
    closeAlert,
  }
}
