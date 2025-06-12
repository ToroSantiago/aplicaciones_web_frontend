"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { User, Menu, X, ShoppingCart } from "lucide-react"
import "./Navbar.css"
import Carrito from "../Carrito/carrito"
import { getCartItemCount } from "../Carrito/carrito"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartItemCount, setCartItemCount] = useState(0)
  const navigate = useNavigate()

  // Actualizar el contador de items del carrito
  useEffect(() => {
    const updateCartCount = () => {
      const count = getCartItemCount()
      console.log("Actualizando contador del carrito:", count) // Debug
      setCartItemCount(count)
    }

    // Actualizar al montar el componente
    updateCartCount()

    // Escuchar cambios en el localStorage y eventos personalizados
    const handleCartUpdate = () => {
      console.log("Evento de carrito detectado") // Debug
      updateCartCount()
    }

    // Agregar múltiples listeners para asegurar que se capture cualquier cambio
    window.addEventListener("storage", handleCartUpdate)
    window.addEventListener("cartUpdated", handleCartUpdate)

    // También escuchar cambios en el foco de la ventana (por si acaso)
    window.addEventListener("focus", handleCartUpdate)

    return () => {
      window.removeEventListener("storage", handleCartUpdate)
      window.removeEventListener("cartUpdated", handleCartUpdate)
      window.removeEventListener("focus", handleCartUpdate)
    }
  }, [])

  // También actualizar el contador cuando se abre/cierra el carrito
  useEffect(() => {
    if (!isCartOpen) {
      const count = getCartItemCount()
      setCartItemCount(count)
    }
  }, [isCartOpen])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen)
    setIsMenuOpen(false)
  }

  const handleNavigation = (path) => {
    navigate(path)
    setIsMenuOpen(false)
  }

  return (
    <>
      <nav className="custom-navbar">
        <div className="navbar-container">
          <div className="navbar-brand-container">
            <button onClick={() => handleNavigation("/")} className="navbar-brand-btn">
              Essenza Royale
            </button>
          </div>

          <div className="desktop-menu">
            <button onClick={toggleCart} className="nav-btn nav-btn-secondary cart-btn" aria-label="Ver carrito">
              <div className="cart-icon-container">
                <ShoppingCart size={16} />
                {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
              </div>
              Carrito
            </button>
            <button onClick={() => handleNavigation("/authForm")} className="nav-btn nav-btn-primary">
              <User size={16} />
              Ingresar
            </button>
          </div>

          <div className="mobile-menu-btn-container">
            <button onClick={toggleMenu} className="mobile-toggle-btn">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <div className={`mobile-menu ${isMenuOpen ? "mobile-menu-open" : ""}`}>
          <div className="mobile-menu-content">
            <button
              onClick={toggleCart}
              className="mobile-nav-btn mobile-nav-btn-secondary cart-btn"
              aria-label="Ver carrito"
            >
              <div className="cart-icon-container">
                <ShoppingCart size={16} />
                {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
              </div>
              Carrito
            </button>
            <button onClick={() => handleNavigation("/authForm")} className="mobile-nav-btn mobile-nav-btn-primary">
              <User size={16} />
              Ingresar
            </button>
          </div>
        </div>
      </nav>

      <Carrito isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}

export default Navbar
