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

      const response = await fetch("https://aplicacioneswebbackend-git-dev-torosantiagos-projects.vercel.app/edp/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: mpItems, payer }),
      })

      const data = await response.json()

      if (!data.success) {
        await showAlert("Error al generar el pago", data.error || "Error desconocido")
        return
      }
      
      console.log(data)
      
      // Redirigir al Checkout de Mercado Pago
      window.location.href = data.init_point

    } catch (error) {
      console.error("Error en checkout:", error)
      await showAlert("Error", "Ocurrió un error al procesar el pago: " + error.message)
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
                      <div className="carrito-item-price">${(item.precio * item.cantidad).toLocaleString("es-AR")}</div>
                      <button className="carrito-item-remove" onClick={() => removeItem(item.variante_id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="carrito-footer">
                  <div className="carrito-summary">
                    <div className="carrito-total">
                      <span>Total:</span>
                      <span>${total.toLocaleString("es-AR")}</span>
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
      precio: product.precio,
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
