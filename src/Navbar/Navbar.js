"use client"

import { useState, useEffect } from "react"
import { Menu, X, ShoppingCart } from "lucide-react"
import "./Navbar.css"
import Carrito from "../Carrito/carrito"
import { getCartItemCount } from "../Carrito/carrito"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartItemCount, setCartItemCount] = useState(0)

  // Actualizar contador de carrito
  useEffect(() => {
    const updateCartCount = () => {
      const count = getCartItemCount()
      setCartItemCount(count)
    }

    updateCartCount()

    const handleCartUpdate = () => {
      updateCartCount()
    }

    window.addEventListener("storage", handleCartUpdate)
    window.addEventListener("cartUpdated", handleCartUpdate)
    window.addEventListener("focus", handleCartUpdate)

    return () => {
      window.removeEventListener("storage", handleCartUpdate)
      window.removeEventListener("cartUpdated", handleCartUpdate)
      window.removeEventListener("focus", handleCartUpdate)
    }
  }, [])

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

  const handleHomeNavigation = () => {
    // Si estás usando React Router, descomenta la siguiente línea:
    // navigate("/")
    // Si estás usando Next.js, puedes usar:
    // router.push("/")
    // Por ahora, simplemente recarga la página o redirige:
    window.location.href = "/"
    setIsMenuOpen(false)
  }

  return (
    <>
      <nav className="custom-navbar">
        <div className="navbar-container">
          <div className="navbar-brand-container">
            <button onClick={handleHomeNavigation} className="navbar-brand-btn">
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
          </div>
        </div>
      </nav>

      <Carrito isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}

export default Navbar
