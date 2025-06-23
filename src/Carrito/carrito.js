"use client"

import { useState, useEffect } from "react"
import { X, Trash2, Plus, Minus } from "lucide-react"
import "./carrito.css"

const Carrito = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState([])
  const [total, setTotal] = useState(0)

  // Cargar items del carrito desde localStorage al iniciar
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

    // Escuchar cambios en el localStorage
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

  // Función para actualizar localStorage y disparar eventos
  const updateCartAndNotify = (newCartItems) => {
    if (newCartItems.length > 0) {
      localStorage.setItem("carrito", JSON.stringify(newCartItems))
    } else {
      localStorage.removeItem("carrito")
    }

    // Disparar evento personalizado para notificar cambios
    window.dispatchEvent(new CustomEvent("cartUpdated"))

    // También disparar evento de storage manualmente para asegurar sincronización
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "carrito",
        newValue: newCartItems.length > 0 ? JSON.stringify(newCartItems) : null,
        storageArea: localStorage,
      }),
    )
  }

  // Calcular el total del carrito
  const calculateTotal = (items) => {
    const sum = items.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
    setTotal(sum)
  }

  // Incrementar cantidad de un producto
  const incrementQuantity = (id) => {
    const newCartItems = cartItems.map((item) => {
      if (item.id === id) {
        if (item.cantidad < item.stock) {
          return { ...item, cantidad: item.cantidad + 1 }
        } else {
          alert(`No hay stock disponible para ${item.nombre} de ${item.volumen}ml`)
        }
      }
      return item
    })
  
    setCartItems(newCartItems)
    updateCartAndNotify(newCartItems)
  }
  

  // Decrementar cantidad de un producto
  const decrementQuantity = (id) => {
    const newCartItems = cartItems.map((item) =>
      item.id === id && item.cantidad > 1 ? { ...item, cantidad: item.cantidad - 1 } : item,
    )
    setCartItems(newCartItems)
    updateCartAndNotify(newCartItems)
  }

  // Eliminar un producto del carrito
  const removeItem = (id) => {
    const newCartItems = cartItems.filter((item) => item.id !== id)
    setCartItems(newCartItems)
    updateCartAndNotify(newCartItems)
  }

  // Vaciar todo el carrito
  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem("carrito")
    updateCartAndNotify([])
  }

  // Proceder al checkout
  const handleCheckout = () => {
    alert("¡Gracias por tu compra! Serás redirigido al proceso de pago.")
  }

  if (!isOpen) return null

  return (
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
                  <div key={item.id} className="carrito-item">
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
                        onClick={() => decrementQuantity(item.id)}
                        disabled={item.cantidad <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="carrito-quantity-value">{item.cantidad}</span>
                      <button className="carrito-quantity-btn" onClick={() => incrementQuantity(item.id)}>
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="carrito-item-price">${(item.precio * item.cantidad).toLocaleString("es-AR")}</div>
                    <button className="carrito-item-remove" onClick={() => removeItem(item.id)}>
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
  )
}

// Función para agregar un producto al carrito
export const addToCart = (product, quantity = 1, selectedVolume) => {
  try {
    const savedCart = localStorage.getItem("carrito")
    let currentCart = []

    if (savedCart && savedCart !== "null" && savedCart !== "undefined") {
      const parsedCart = JSON.parse(savedCart)
      if (Array.isArray(parsedCart)) {
        currentCart = parsedCart
      }
    }

    const productId = `${product.id}-${selectedVolume}`
    const existingItemIndex = currentCart.findIndex((item) => item.id === productId)
    const existingItem = currentCart[existingItemIndex]

    // Validar stock antes de agregar
    const stockDisponible = product.stock

    const cantidadActualEnCarrito = existingItem ? existingItem.cantidad : 0
    const nuevaCantidad = cantidadActualEnCarrito + quantity

    if (nuevaCantidad > stockDisponible) {
      alert(`¡Solo hay ${stockDisponible} unidades disponibles de ${product.nombre} ${selectedVolume}ml!`)
      return currentCart
    }

    const productToAdd = {
      id: productId,
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

    // Disparar múltiples eventos para asegurar sincronización
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


// Función para obtener el número de items en el carrito
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

export default Carrito
