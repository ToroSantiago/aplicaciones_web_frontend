import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Importar
import { User, Phone, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate(); // ✅ Hook de navegación

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavigation = (path) => {
    navigate(path); // ✅ Redirecciona usando React Router
    setIsMenuOpen(false);
  };

  return (
    <nav className="custom-navbar">
      <div className="navbar-container">
        <div className="navbar-brand-container">
          <button 
            onClick={() => handleNavigation('/')}
            className="navbar-brand-btn"
          >
            Essenza Royale
          </button>
        </div>

        <div className="desktop-menu">
          <button
            onClick={() => handleNavigation('/contacto')}
            className="nav-btn nav-btn-secondary"
          >
            <Phone size={16} />
            Contacto
          </button>
          <button
            onClick={() => handleNavigation('/authForm')}
            className="nav-btn nav-btn-primary"
          >
            <User size={16} />
            Ingresar
          </button>
        </div>

        <div className="mobile-menu-btn-container">
          <button
            onClick={toggleMenu}
            className="mobile-toggle-btn"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div className={`mobile-menu ${isMenuOpen ? 'mobile-menu-open' : ''}`}>
        <div className="mobile-menu-content">
          <button
            onClick={() => handleNavigation('/contacto')}
            className="mobile-nav-btn mobile-nav-btn-secondary"
          >
            <Phone size={16} />
            Contacto
          </button>
          <button
            onClick={() => handleNavigation('/authForm')}
            className="mobile-nav-btn mobile-nav-btn-primary"
          >
            <User size={16} />
            Ingresar
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
