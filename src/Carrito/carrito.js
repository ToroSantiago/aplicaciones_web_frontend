"use client"

import { useState, useEffect } from "react"
import { X, Trash2, Plus, Minus } from "lucide-react"
import { ConfirmModal, AlertModal, useCustomModal } from "../Modal/modal"
import "./carrito.css"

const Carrito = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState([])
  const [total, setTotal] = useState(0)
  const { confirmModal, alertModal, showConfirm, showAlert, closeAlert } = useCustomModal()

  useEffect(() => {
    const loadCartItems = () => {
      try {
        const savedCart = localStorage.getItem("carrito")
        if (savedCart && savedCart !== "null" && savedCart !== "undefined") {
          const parsedCart = JSON.parse(savedCart)
          if (Array.isArray(parsedCart)) {
            setCartItems(parsedCart)
            calculateTotal(parsedCart)
          } else {
            setCartItems([])
            setTotal(0)
          }
        } else {
          setCartItems([])
          setTotal(0)
        }
      } catch (error) {
        console.error("Error loading cart:", error)
        setCartItems([])
        setTotal(0)
      }
    }

    loadCartItems()

    const handleStorageChange = () => {
      loadCartItems()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("cartUpdated", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("cartUpdated", handleStorageChange)
    }
  }, [])

  const updateCartAndNotify = (newCartItems) => {
    if (newCartItems.length > 0) {
      localStorage.setItem("carrito", JSON.stringify(newCartItems))
    } else {
      localStorage.removeItem("carrito")
    }

    window.dispatchEvent(new CustomEvent("cartUpdated"))
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "carrito",
        newValue: newCartItems.length > 0 ? JSON.stringify(newCartItems) : null,
        storageArea: localStorage,
      }),
    )
  }

  const calculateTotal = (items) => {
    const sum = items.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
    setTotal(sum)
  }

  const incrementQuantity = async (varianteId) => {
    const item = cartItems.find((item) => item.variante_id === varianteId)
    if (item && item.cantidad >= item.stock) {
      await showAlert("Stock Insuficiente", `No hay más stock disponible para ${item.nombre} de ${item.volumen}ml`)
      return
    }

    const newCartItems = cartItems.map((item) => {
      if (item.variante_id === varianteId) {
        if (item.cantidad < item.stock) {
          return { ...item, cantidad: item.cantidad + 1 }
        }
      }
      return item
    })

    setCartItems(newCartItems)
    updateCartAndNotify(newCartItems)
  }

  const decrementQuantity = (varianteId) => {
    const newCartItems = cartItems.map((item) =>
      item.variante_id === varianteId && item.cantidad > 1 ? { ...item, cantidad: item.cantidad - 1 } : item,
    )
    setCartItems(newCartItems)
    updateCartAndNotify(newCartItems)
  }

  const removeItem = async (varianteId) => {
    const item = cartItems.find((item) => item.variante_id === varianteId)
    const confirmed = await showConfirm(
      "Eliminar Producto",
      `¿Estás seguro de que quieres eliminar ${item?.nombre} del carrito?`,
    )

    if (confirmed) {
      const newCartItems = cartItems.filter((item) => item.variante_id !== varianteId)
      setCartItems(newCartItems)
      updateCartAndNotify(newCartItems)
    }
  }

  const clearCart = async () => {
    const confirmed = await showConfirm(
      "Vaciar Carrito",
      "¿Estás seguro de que quieres eliminar todos los productos del carrito?",
    )

    if (confirmed) {
      setCartItems([])
      localStorage.removeItem("carrito")
      updateCartAndNotify([])
      await showAlert("Carrito Vaciado", "Se han eliminado todos los productos del carrito")
    }
  }

  // Función handleCheckout mejorada con debugging y manejo de errores
  const handleCheckout = async () => {
    if (cartItems.length === 0) return

    const confirmed = await showConfirm("Confirmar Compra", "¿Estás seguro de que quieres proceder con la compra?")
    if (!confirmed) return

    try {
      const mpItems = cartItems.map((item) => ({
        id: item.variante_id,
        title: `${item.nombre} - ${item.volumen}ml`,
        quantity: item.cantidad,
        unit_price: parseFloat(item.precio),
      }))

      const payer = {
        name: "Cliente",
        surname: "Invitado",
        email: "test_user_646915520@testuser.com",
      }

      const requestBody = { items: mpItems, payer }
      
      console.log("🚀 Enviando request:", JSON.stringify(requestBody, null, 2))

      const response = await fetch("https://aplicacioneswebbackend-git-dev-torosantiagos-projects.vercel.app/edp/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json", // Importante: especificar que esperamos JSON
        },
        body: JSON.stringify(requestBody),
      })

      console.log("📡 Response status:", response.status)
      console.log("📡 Response headers:", [...response.headers.entries()])

      // Verificar si la respuesta es JSON antes de parsear
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text()
        console.error("❌ Respuesta no es JSON:", textResponse)
        await showAlert("Error del Servidor", `El servidor respondió con un error. Status: ${response.status}. Por favor, revisa la consola para más detalles.`)
        return
      }

      const data = await response.json()
      console.log("📦 Response data:", data)

      if (!response.ok) {
        console.error("❌ Response not OK:", response.status, data)
        await showAlert("Error al generar el pago", data.error || `Error del servidor (${response.status})`)
        return
      }

      if (!data.success) {
        await showAlert("Error al generar el pago", data.error || "Error desconocido")
        return
      }
      
      console.log("✅ Pago creado exitosamente:", data)
      
      // Redirigir al Checkout de Mercado Pago
      if (data.init_point) {
        window.location.href = data.init_point
      } else {
        await showAlert("Error", "No se recibió la URL de pago")
      }

    } catch (error) {
      console.error("💥 Error en checkout:", error)
      
      if (error instanceof SyntaxError && error.message.includes("Unexpected token")) {
        await showAlert("Error del Servidor", "El servidor está devolviendo HTML en lugar de JSON. Esto suele indicar un error 500 en el backend. Por favor, revisa los logs del servidor.")
      } else {
        await showAlert("Error", "Ocurrió un error al procesar el pago: " + error.message)
      }
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="carrito-overlay" onClick={onClose}>
        <div className="carrito-container" onClick={(e) => e.stopPropagation()}>
          <div className="carrito-header">
            <h2 className="carrito-title">Tu Carrito</h2>
            <button className="carrito-close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className="carrito-content">
            {cartItems.length === 0 ? (
              <div className="carrito-empty">
                <p>Tu carrito está vacío</p>
                <button className="carrito-continue-btn" onClick={onClose}>
                  Continuar Comprando
                </button>
              </div>
            ) : (
              <>
                <div className="carrito-items">
                  {cartItems.map((item) => (
                    <div key={item.variante_id} className="carrito-item">
                      <div className="carrito-item-image">
                        <img
                          src={item.imagen_url || "https://via.placeholder.com/100x100/1a1a1a/ffffff?text=Sin+Imagen"}
                          alt={item.nombre}
                        />
                      </div>
                      <div className="carrito-item-details">
                        <h3 className="carrito-item-name">{item.nombre}</h3>
                        <p className="carrito-item-brand">{item.marca}</p>
                        <p className="carrito-item-volume">{item.volumen}ml</p>
                      </div>
                      <div className="carrito-item-quantity">
                        <button
                          className="carrito-quantity-btn"
                          onClick={() => decrementQuantity(item.variante_id)}
                          disabled={item.cantidad <= 1}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="carrito-quantity-value">{item.cantidad}</span>
                        <button className="carrito-quantity-btn" onClick={() => incrementQuantity(item.variante_id)}>
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="carrito-item-price">
                        {item.tiene_descuento && item.precio_original > item.precio && (
                          <div className="carrito-item-price-original">
                            ${(item.precio_original * item.cantidad).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        )}
                        <div>${(item.precio * item.cantidad).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        {item.tiene_descuento && (
                          <span className="carrito-item-discount-badge">
                            -{Math.round(item.descuento_porcentaje)}%
                          </span>
                        )}
                      </div>
                      <button className="carrito-item-remove" onClick={() => removeItem(item.variante_id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="carrito-footer">
                  <div className="carrito-summary">
                    {(() => {
                      // Si algún item del carrito tiene descuento, mostramos
                      // cuánto se está ahorrando el cliente vs. precios originales.
                      const totalOriginal = cartItems.reduce(
                        (acc, it) => acc + (it.precio_original ?? it.precio) * it.cantidad,
                        0
                      )
                      const ahorro = totalOriginal - total
                      if (ahorro <= 0.01) return null
                      return (
                        <div className="carrito-savings">
                          <span>Te ahorrás:</span>
                          <span>${ahorro.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      )
                    })()}
                    <div className="carrito-total">
                      <span>Total:</span>
                      <span>${total.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  <div className="carrito-actions">
                    <button className="carrito-clear-btn" onClick={clearCart}>
                      Vaciar Carrito
                    </button>
                    <button className="carrito-checkout-btn" onClick={handleCheckout}>
                      Proceder al Pago
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modales personalizados */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={confirmModal.onCancel}
      />

      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        onClose={closeAlert}
      />
    </>
  )
}

export default Carrito

// --- Funciones auxiliares exportadas para uso externo ---

export const addToCart = async (product, quantity = 1, selectedVolume) => {
  try {
    const savedCart = localStorage.getItem("carrito")
    let currentCart = []

    if (savedCart && savedCart !== "null" && savedCart !== "undefined") {
      const parsedCart = JSON.parse(savedCart)
      if (Array.isArray(parsedCart)) {
        currentCart = parsedCart
      }
    }

    const varianteIdReal = product.variante_id || product.id
    const productId = `${product.id}-${selectedVolume}`
    const existingItemIndex = currentCart.findIndex((item) => item.id === productId)
    const existingItem = currentCart[existingItemIndex]

    const stockDisponible = product.stock
    const cantidadActualEnCarrito = existingItem ? existingItem.cantidad : 0
    const nuevaCantidad = cantidadActualEnCarrito + quantity

    if (nuevaCantidad > stockDisponible) {
      // Crear y mostrar modal de alerta personalizado
      const alertModal = document.createElement("div")
      alertModal.innerHTML = `
        <div class="custom-modal-overlay">
          <div class="custom-modal alert-modal">
            <div class="custom-modal-header">
              <h3 class="custom-modal-title">Stock Insuficiente</h3>
            </div>
            <div class="custom-modal-content">
              <div class="custom-modal-icon">⚠️</div>
              <p class="custom-modal-message">¡Solo hay ${stockDisponible} unidades disponibles de ${product.nombre} ${selectedVolume}ml!</p>
            </div>
            <div class="custom-modal-actions">
              <button class="custom-modal-btn confirm-btn">Aceptar</button>
            </div>
          </div>
        </div>
      `
      document.body.appendChild(alertModal)

      alertModal.querySelector(".confirm-btn").onclick = () => {
        document.body.removeChild(alertModal)
      }

      alertModal.querySelector(".custom-modal-overlay").onclick = (e) => {
        if (e.target === alertModal.querySelector(".custom-modal-overlay")) {
          document.body.removeChild(alertModal)
        }
      }

      return currentCart
    }

    const productToAdd = {
      id: productId,
      variante_id: varianteIdReal,
      nombre: product.nombre,
      marca: product.marca,
      // `precio` guarda el precio efectivo (precio_final si hay descuento
      // vigente). Es el que se usa para totales y se envía a MP como unit_price.
      precio: product.precio,
      // Campos opcionales solo para mostrar el tachado y badge en el carrito.
      // Si vienen undefined (items viejos en localStorage), el UI los trata
      // como "sin descuento".
      precio_original: product.precio_original ?? product.precio,
      tiene_descuento: !!product.tiene_descuento,
      descuento_porcentaje: Number.parseFloat(product.descuento_porcentaje ?? 0),
      imagen_url: product.imagen_url,
      volumen: selectedVolume,
      cantidad: quantity,
      stock: stockDisponible,
    }

    if (existingItemIndex >= 0) {
      currentCart[existingItemIndex].cantidad = nuevaCantidad
    } else {
      currentCart.push(productToAdd)
    }

    localStorage.setItem("carrito", JSON.stringify(currentCart))
    window.dispatchEvent(new CustomEvent("cartUpdated"))
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "carrito",
        newValue: JSON.stringify(currentCart),
        storageArea: localStorage,
      }),
    )

    return currentCart
  } catch (error) {
    console.error("Error adding to cart:", error)
    return []
  }
}

export const getCartItemCount = () => {
  try {
    const savedCart = localStorage.getItem("carrito")

    if (!savedCart || savedCart === "null" || savedCart === "undefined") {
      return 0
    }

    const cart = JSON.parse(savedCart)

    if (!Array.isArray(cart) || cart.length === 0) {
      return 0
    }

    return cart.reduce((total, item) => {
      const cantidad = typeof item.cantidad === "number" ? item.cantidad : 0
      return total + cantidad
    }, 0)
  } catch (error) {
    console.error("Error getting cart count:", error)
    return 0
  }
}
