"use client"

import { useState } from "react"
import "./Footer.css"

const Footer = () => {
  const [mapLoaded, setMapLoaded] = useState(false)

  const contactInfo = {
    name: "Essenza Royale",
    address: "Mitre 655, Trelew, Chubut",
    phone: "+54 280 442-3456",
    email: "info@essenzaroyale.com",
    whatsapp: "+54 9 280 442-3456",
    hours: {
      weekdays: "Lunes a Viernes: 9:00 - 20:00",
      saturday: "Sábados: 9:00 - 18:00",
      sunday: "Domingos: 10:00 - 16:00",
    },
  }

  const socialLinks = [
    { name: "Instagram", icon: "📷", url: "#" },
    { name: "Facebook", icon: "📘", url: "#" },
    { name: "WhatsApp", icon: "💬", url: `https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, "")}` },
  ]

  return (
    <footer className="luxury-footer">
      <div className="luxury-footer-container">
        {/* Sección principal del footer */}
        <div className="luxury-footer-main">
          {/* Información de la empresa */}
          <div className="luxury-footer-section luxury-footer-brand">
            <div className="luxury-footer-logo">
              <h3 className="luxury-footer-title">{contactInfo.name}</h3>
              <p className="luxury-footer-subtitle">Perfumería de Lujo</p>
            </div>
            <p className="luxury-footer-description">
              Descubre la elegancia en cada fragancia. Ofrecemos las mejores marcas de perfumes de lujo con la atención
              personalizada que mereces.
            </p>
          </div>

          {/* Información de contacto */}
          <div className="luxury-footer-section luxury-footer-contact">
            <h4 className="luxury-footer-section-title">Contacto</h4>
            <div className="luxury-footer-contact-info">
              <div className="luxury-footer-contact-item">
                <span className="luxury-footer-contact-icon">📍</span>
                <div className="luxury-footer-contact-details">
                  <span className="luxury-footer-contact-label">Dirección</span>
                  <span className="luxury-footer-contact-value">{contactInfo.address}</span>
                </div>
              </div>

              <div className="luxury-footer-contact-item">
                <span className="luxury-footer-contact-icon">💬</span>
                <div className="luxury-footer-contact-details">
                  <span className="luxury-footer-contact-label">WhatsApp</span>
                  <a
                    href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, "")}`}
                    className="luxury-footer-contact-value luxury-footer-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {contactInfo.whatsapp}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Horarios */}
          <div className="luxury-footer-section luxury-footer-hours">
            <h4 className="luxury-footer-section-title">Horarios de Atención</h4>
            <div className="luxury-footer-hours-list">
              <div className="luxury-footer-hours-item">
                <span className="luxury-footer-hours-days">Lunes a Viernes</span>
                <span className="luxury-footer-hours-time">9:00 - 20:00</span>
              </div>
              <div className="luxury-footer-hours-item">
                <span className="luxury-footer-hours-days">Sábados</span>
                <span className="luxury-footer-hours-time">9:00 - 14:00</span>
              </div>
              <div className="luxury-footer-hours-item">
                <span className="luxury-footer-hours-days">Domingos</span>
                <span className="luxury-footer-hours-time"> CERRADO </span>
              </div>
            </div>
          </div>

          {/* Mapa */}
          <div className="luxury-footer-section luxury-footer-map">
            <h4 className="luxury-footer-section-title">Ubicación</h4>
            <div className="luxury-footer-map-container">
              {!mapLoaded ? (
                <div className="luxury-footer-map-placeholder" onClick={() => setMapLoaded(true)}>
                  <div className="luxury-footer-map-icon">🗺️</div>
                  <div className="luxury-footer-map-text">
                    <span className="luxury-footer-map-title">Ver Mapa</span>
                    <span className="luxury-footer-map-address">{contactInfo.address}</span>
                  </div>
                  <div className="luxury-footer-map-button">
                    <span>Cargar Mapa</span>
                  </div>
                </div>
              ) : (
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2998.123456789!2d-65.3055555!3d-43.2555555!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDPCsDE1JzIwLjAiUyA2NcKwMTgnMjAuMCJX!5e0!3m2!1ses!2sar!4v1234567890123"
                  className="luxury-footer-map-iframe"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación de Essenza Royale"
                ></iframe>
              )}
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="luxury-footer-divider"></div>

        {/* Footer inferior */}
        <div className="luxury-footer-bottom">
          <div className="luxury-footer-bottom-content">
            <div className="luxury-footer-copyright">
              <span>© 2025 {contactInfo.name}. Todos los derechos reservados.</span>
            </div>
            <div className="luxury-footer-links">
              <a href="#" className="luxury-footer-bottom-link">
                Términos y Condiciones
              </a>
              <a href="#" className="luxury-footer-bottom-link">
                Política de Privacidad
              </a>
              <a href="#" className="luxury-footer-bottom-link">
                Cambios y Devoluciones
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
