"use client"

import { useState, useEffect } from "react"
import { X, Trash2, Plus, Minus } from "lucide-react"
import { ConfirmModal, AlertModal, useCustomModal } from "../Modal/modal"
import { useNavigate } from "react-router-dom"
import { API_BASE_URL, fetchAuth, getCurrentUser, isCliente, onAuthChange } from "../auth/auth"
import "./carrito.css"

// ---------------------------------------------------------------------
// Cart key namespacing
// ---------------------------------------------------------------------
// El carrito vive en localStorage bajo una key distinta según haya o no
// haya sesión, para que el carrito del cliente persista entre sesiones
// sin mezclarse con el de otro usuario que use el mismo navegador.
//
//   - Sin sesión: 'carrito_guest'
//   - Logueado:   'carrito_<userId>'
//
// LEGACY_KEY es la clave antigua ('carrito'). Si existe, la migramos a
// guest la primera vez que cargue el cliente (ver migrateLegacyCart()).
// ---------------------------------------------------------------------
const LEGACY_KEY = "carrito"
const GUEST_KEY = "carrito_guest"

const getCartKey = () => {
  const user = getCurrentUser()
  return user?.id ? `carrito_${user.id}` : GUEST_KEY
}

const readCartFrom = (key) => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw || raw === "null" || raw === "undefined") return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.error(`Error leyendo carrito ${key}:`, e)
    return []
  }
}

const writeCartTo = (key, items) => {
  if (items.length > 0) {
    localStorage.setItem(key, JSON.stringify(items))
  } else {
    localStorage.removeItem(key)
  }
}

// Migra el carrito viejo (key 'carrito') a guest la primera vez que
// cargue. Idempotente: si guest ya tiene items, no pisa nada.
const migrateLegacyCart = () => {
  const legacy = localStorage.getItem(LEGACY_KEY)
  if (!legacy) return
  if (!localStorage.getItem(GUEST_KEY)) {
    localStorage.setItem(GUEST_KEY, legacy)
  }
  localStorage.removeItem(LEGACY_KEY)
}
migrateLegacyCart()

const Carrito = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [total, setTotal] = useState(0)
  const { confirmModal, alertModal, showConfirm, showAlert, closeAlert } = useCustomModal()

  useEffect(() => {
    const loadCartItems = () => {
      const items = readCartFrom(getCartKey())
      setCartItems(items)
      calculateTotal(items)
    }

    loadCartItems()

    // Recargar cuando cambie el storage (cross-tab), cuando se agregue
    // algo al carrito en otro componente (cartUpdated), o cuando el
    // usuario haga login/logout (authChanged → cambia la cart key).
    window.addEventListener("storage", loadCartItems)
    window.addEventListener("cartUpdated", loadCartItems)
    const offAuth = onAuthChange(loadCartItems)

    return () => {
      window.removeEventListener("storage", loadCartItems)
      window.removeEventListener("cartUpdated", loadCartItems)
      offAuth()
    }
  }, [])

  const updateCartAndNotify = (newCartItems) => {
    const key = getCartKey()
    writeCartTo(key, newCartItems)

    window.dispatchEvent(new CustomEvent("cartUpdated"))
    window.dispatchEvent(
      new StorageEvent("storage", {
        key,
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
      // updateCartAndNotify ya elimina la key actual cuando le pasas [].
      updateCartAndNotify([])
      await showAlert("Carrito Vaciado", "Se han eliminado todos los productos del carrito")
    }
  }

  // Función handleCheckout mejorada con debugging y manejo de errores
  const handleCheckout = async () => {
    if (cartItems.length === 0) return

    // Para checkout tenés que estar logueado como Cliente: la venta se
    // asigna al usuario autenticado vía Bearer token. Antes mandabamos un
    // payer hardcodeado y todas las ventas terminaban en un mismo usuario fake.
    const user = getCurrentUser()
    if (!user || !isCliente()) {
      const confirmedLogin = await showConfirm(
        "Tenés que iniciar sesión",
        "Para finalizar la compra necesitás estar logueado como cliente. ¿Querés ir al login?"
      )
      if (confirmedLogin) {
        onClose()
        navigate("/authForm")
      }
      return
    }

    const confirmed = await showConfirm("Confirmar Compra", "¿Estás seguro de que quieres proceder con la compra?")
    if (!confirmed) return

    try {
      const mpItems = cartItems.map((item) => ({
        id: item.variante_id,
        title: `${item.nombre} - ${item.volumen}ml`,
        quantity: item.cantidad,
        unit_price: parseFloat(item.precio),
      }))

      // payer = datos del cliente logueado. El backend igualmente usa el
      // Bearer token para asignar la venta (defensa en profundidad).
      const payer = {
        name: user.nombre,
        surname: user.apellido,
        email: user.email,
      }

      const requestBody = { items: mpItems, payer }

      console.log("🚀 Enviando request:", JSON.stringify(requestBody, null, 2))

      // fetchAuth agrega Authorization: Bearer <token> automáticamente.
      const response = await fetchAuth(`${API_BASE_URL}/checkout`, {
        method: "POST",
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

/**
 * Agrega un producto al carrito en localStorage.
 *
 * Devuelve { ok, error?, message?, cart } para que el componente que lo
 * invoque maneje los avisos al usuario con su propio sistema de modales.
 * Antes esta función pintaba un modal manipulando el DOM directamente
 * (document.createElement), lo cual rompía la cohesión con el resto de
 * la UI y mezclaba responsabilidades.
 *
 * Códigos de error posibles:
 *   - 'STOCK_INSUFFICIENT': la cantidad pedida supera el stock disponible.
 *   - 'EXCEPTION': error inesperado (problema con localStorage, JSON, etc.).
 */
export const addToCart = async (product, quantity = 1, selectedVolume) => {
  try {
    const key = getCartKey()
    let currentCart = readCartFrom(key)

    const varianteIdReal = product.variante_id || product.id
    const productId = `${product.id}-${selectedVolume}`
    const existingItemIndex = currentCart.findIndex((item) => item.id === productId)
    const existingItem = currentCart[existingItemIndex]

    const stockDisponible = product.stock
    const cantidadActualEnCarrito = existingItem ? existingItem.cantidad : 0
    const nuevaCantidad = cantidadActualEnCarrito + quantity

    if (nuevaCantidad > stockDisponible) {
      return {
        ok: false,
        error: "STOCK_INSUFFICIENT",
        message: `Solo hay ${stockDisponible} unidades disponibles de ${product.nombre} ${selectedVolume}ml.`,
        cart: currentCart,
      }
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

    writeCartTo(key, currentCart)
    window.dispatchEvent(new CustomEvent("cartUpdated"))
    window.dispatchEvent(
      new StorageEvent("storage", {
        key,
        newValue: JSON.stringify(currentCart),
        storageArea: localStorage,
      }),
    )

    return { ok: true, cart: currentCart }
  } catch (error) {
    console.error("Error adding to cart:", error)
    return {
      ok: false,
      error: "EXCEPTION",
      message: "Ocurrió un error inesperado al agregar el producto al carrito.",
      cart: [],
    }
  }
}

export const getCartItemCount = () => {
  try {
    const cart = readCartFrom(getCartKey())
    if (cart.length === 0) return 0
    return cart.reduce((total, item) => {
      const cantidad = typeof item.cantidad === "number" ? item.cantidad : 0
      return total + cantidad
    }, 0)
  } catch (error) {
    console.error("Error getting cart count:", error)
    return 0
  }
}

/**
 * Mergea el carrito guest con el del usuario (sumando cantidades para items
 * iguales, respetando stock). Se llama después de un login exitoso para que
 * el cliente no pierda lo que tenía en el carrito antes de loguearse.
 *
 * El carrito guest se vacía después del merge.
 */
export const mergeGuestCartIntoUser = () => {
  const user = getCurrentUser()
  if (!user?.id) return // no hay sesión, nada que mergear

  const guestItems = readCartFrom(GUEST_KEY)
  if (guestItems.length === 0) return

  const userKey = `carrito_${user.id}`
  const userItems = readCartFrom(userKey)

  // Mergeamos por id (que es perfumeId-volumen) → suma de cantidades, capeada al stock.
  const mergedById = new Map(userItems.map((it) => [it.id, { ...it }]))
  for (const guestIt of guestItems) {
    const existing = mergedById.get(guestIt.id)
    if (existing) {
      const cap = Math.max(existing.stock ?? 0, guestIt.stock ?? 0)
      existing.cantidad = Math.min(existing.cantidad + guestIt.cantidad, cap)
    } else {
      mergedById.set(guestIt.id, { ...guestIt })
    }
  }
  const merged = Array.from(mergedById.values())

  writeCartTo(userKey, merged)
  writeCartTo(GUEST_KEY, []) // vaciamos guest

  window.dispatchEvent(new CustomEvent("cartUpdated"))
}
