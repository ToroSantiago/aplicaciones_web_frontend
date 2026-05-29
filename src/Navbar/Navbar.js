"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Menu, X, ShoppingCart, User, LogIn, LogOut, UserPlus, Receipt } from "lucide-react"
import { AlertModal, useCustomModal } from "../Modal/modal"
import Carrito, { getCartItemCount } from "../Carrito/carrito"
import { getCurrentUser, isLoggedIn, isCliente, logout, onAuthChange } from "../auth/auth"
import "./Navbar.css"

const Navbar = () => {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartItemCount, setCartItemCount] = useState(0)

  // Estado de sesión que dispara re-render del Navbar cuando cambia.
  // Lo mantenemos en useState para que React reaccione; el dato real
  // vive en localStorage y se sincroniza vía el evento authChanged.
  const [user, setUser] = useState(getCurrentUser())
  const loggedIn = isLoggedIn() && Boolean(user)
  const clienteLogged = loggedIn && isCliente()

  // Modal compartido para el aviso de "sesión cerrada"
  const { alertModal, showAlert, closeAlert } = useCustomModal()

  // Sincronización con localStorage + eventos custom
  useEffect(() => {
    const refresh = () => {
      setCartItemCount(getCartItemCount())
      setUser(getCurrentUser())
    }
    refresh()

    window.addEventListener("storage", refresh)
    window.addEventListener("cartUpdated", refresh)
    window.addEventListener("focus", refresh)
    const offAuth = onAuthChange(refresh)

    return () => {
      window.removeEventListener("storage", refresh)
      window.removeEventListener("cartUpdated", refresh)
      window.removeEventListener("focus", refresh)
      offAuth()
    }
  }, [])

  useEffect(() => {
    // Al cerrar el carrito refrescamos el contador (puede haber bajado).
    if (!isCartOpen) {
      setCartItemCount(getCartItemCount())
    }
  }, [isCartOpen])

  const closeMobileMenu = () => setIsMenuOpen(false)

  const toggleMenu = () => setIsMenuOpen((v) => !v)

  const toggleCart = () => {
    setIsCartOpen((v) => !v)
    closeMobileMenu()
  }

  const goTo = (path) => {
    navigate(path)
    closeMobileMenu()
  }

  const handleLogout = async () => {
    await logout()
    await showAlert("Sesión cerrada", "Hasta la próxima.")
    navigate("/")
  }

  // ----- Render de los botones de sesión (lo reuso en desktop y mobile) -----
  const renderAuthButtons = (isMobile = false) => {
    const cls = isMobile ? "mobile-nav-btn" : "nav-btn"
    const secondary = isMobile ? "mobile-nav-btn-secondary" : "nav-btn-secondary"

    if (clienteLogged) {
      return (
        <>
          <span className={`${cls} ${secondary} user-greet`} title={user.email}>
            <User size={16} /> Hola, {user.nombre}
          </span>
          <button className={`${cls} ${secondary}`} onClick={() => goTo("/mis-compras")}>
            <Receipt size={16} /> Mis compras
          </button>
          <button className={`${cls} ${secondary}`} onClick={handleLogout}>
            <LogOut size={16} /> Cerrar sesión
          </button>
        </>
      )
    }

    return (
      <>
        <button className={`${cls} ${secondary}`} onClick={() => goTo("/authForm")}>
          <LogIn size={16} /> Iniciar sesión
        </button>
        <button className={`${cls} ${secondary}`} onClick={() => goTo("/register")}>
          <UserPlus size={16} /> Registrarse
        </button>
      </>
    )
  }

  return (
    <>
      <nav className="custom-navbar">
        <div className="navbar-container">
          <div className="navbar-brand-container">
            <button onClick={() => goTo("/")} className="navbar-brand-btn">
              <img
                src="https://res.cloudinary.com/drnzeqcpu/image/upload/v1779636864/logo_t96wg3.svg"
                alt="Essenza Royale"
                className="navbar-logo"
              />
            </button>
          </div>

          <div className="desktop-menu">
            {renderAuthButtons(false)}
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
            {renderAuthButtons(true)}
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

      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        onClose={closeAlert}
      />
    </>
  )
}

export default Navbar
