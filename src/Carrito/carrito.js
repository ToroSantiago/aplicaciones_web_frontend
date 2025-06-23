"use client"

import { useState, useEffect } from "react"
import { X, Trash2, Plus, Minus } from "lucide-react"
import "./carrito.css"

const Carrito = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState([])
  const [total, setTotal] = useState(0)

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

  const decrementQuantity = (id) => {
    const newCartItems = cartItems.map((item) =>
      item.id === id && item.cantidad > 1 ? { ...item, cantidad: item.cantidad - 1 } : item,
    )
    setCartItems(newCartItems)
    updateCartAndNotify(newCartItems)
  }

  const removeItem = (id) => {
    const newCartItems = cartItems.filter((item) => item.id !== id)
    setCartItems(newCartItems)
    updateCartAndNotify(newCartItems)
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem("carrito")
    updateCartAndNotify([])
  }

  const handleCheckout = async () => {
    console.log("DEBUG - cartItems:", cartItems)
    if (cartItems.length === 0) return

    const confirmCheckout = window.confirm("¿Deseás confirmar la compra?")
    if (!confirmCheckout) return

    try {
      // Validar que todas las variantes tengan id válido
      const itemsToBuy = cartItems.map((item) => {
        const idReal = item.variante_id || item.id
        if (!idReal) {
          throw new Error(`El producto ${item.nombre} no tiene un ID válido para la compra.`)
        }
        return {
          id: idReal,
          cantidad: item.cantidad,
        }
      })

      console.log("DEBUG - Enviando items: ", itemsToBuy)

      const response = await fetch("http://127.0.0.1:8000/edp/compra", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: itemsToBuy }),
      })

      if (!response.ok) {
        // Intentar leer el mensaje de error del backend
        let errorData = {}
        try {
          errorData = await response.json()
        } catch {
          // No JSON, ignorar
        }
        alert("Error al comprar: " + (errorData.message || `HTTP ${response.status}`))
        return
      }

      const data = await response.json()

      alert("¡Compra realizada con éxito!")

      clearCart()
      onClose()
    } catch (error) {
      console.error("Error al procesar el checkout:", error)
      alert("Ocurrió un error durante la compra: " + error.message)
    }
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

    // Usar variante_id si existe, sino product.id (para backend)
    const varianteIdReal = product.variante_id || product.id

    const productId = `${product.id}-${selectedVolume}`
    const existingItemIndex = currentCart.findIndex((item) => item.id === productId)
    const existingItem = currentCart[existingItemIndex]

    const stockDisponible = product.stock

    const cantidadActualEnCarrito = existingItem ? existingItem.cantidad : 0
    const nuevaCantidad = cantidadActualEnCarrito + quantity

    if (nuevaCantidad > stockDisponible) {
      alert(`¡Solo hay ${stockDisponible} unidades disponibles de ${product.nombre} ${selectedVolume}ml!`)
      return currentCart
    }

    const productToAdd = {
      id: productId, // clave única para el frontend
      variante_id: varianteIdReal, // id real para backend
      nombre: product.nombre,
      marca: product.marca,
      precio: product.precio,
      imagen_url: product.imagen_url,
      volumen: selectedVolume,
      cantidad: quantity,
      stock: stockDisponible,
    }

    console.log("DEBUG - Agregando producto al carrito:", productToAdd)

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

export default Carrito
