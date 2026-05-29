"use client"

import "./Footer.css"

const Footer = () => {

  const contactInfo = {
    name: "Essenza Royale",
    address: "Mitre 655, Trelew, Chubut",
    whatsapp: "2804 584782",
  }

  const hours = [
    { days: "Lunes a Viernes", time: "9:00 - 20:00" },
    { days: "Sábados", time: "9:00 - 14:00" },
    { days: "Domingos", time: "Cerrado" },
  ]

  return (
    <footer className="luxury-footer">
      <div className="luxury-footer-container">
        <div className="luxury-footer-main">
          {/* Brand */}
          <div className="luxury-footer-section luxury-footer-brand">
            <div className="luxury-footer-logo">
              <h3 className="luxury-footer-title">{contactInfo.name}</h3>
              <p className="luxury-footer-subtitle">
                Perfumería de Lujo
              </p>
            </div>

            <p className="luxury-footer-description">
              Descubre la elegancia en cada fragancia.
            </p>
          </div>

          {/* Contacto */}
          <div className="luxury-footer-section">
            <h4 className="luxury-footer-section-title">
              Contacto
            </h4>

            <div className="luxury-footer-contact-info">
              <div className="luxury-footer-contact-item">
                <div className="luxury-footer-contact-details">
                  <span className="luxury-footer-contact-label">
                    Dirección
                  </span>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Mitre+655+Trelew+Chubut"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="luxury-footer-link luxury-footer-contact-value luxury-footer-map-address-link"
                  >
                    {contactInfo.address}
                  </a>
                </div>
              </div>

              <div className="luxury-footer-contact-item">
                <div className="luxury-footer-contact-details">
                  <span className="luxury-footer-contact-label">
                    WhatsApp
                  </span>

                  <a
                    href={`https://wa.me/542804584782?text=${encodeURIComponent(
                      "Hola, quería consultar por un perfume."
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="luxury-footer-link luxury-footer-contact-value"
                  >
                    {contactInfo.whatsapp}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Horarios */}
          <div className="luxury-footer-section">
            <h4 className="luxury-footer-section-title">
              Horarios
            </h4>

            <div className="luxury-footer-hours-list">
              {hours.map((item) => (
                <div
                  key={item.days}
                  className="luxury-footer-hours-item"
                >
                  <span className="luxury-footer-hours-days">
                    {item.days}
                  </span>

                  <span className="luxury-footer-hours-time">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="luxury-footer-divider" />

        {/* Bottom */}
        <div className="luxury-footer-bottom">
          <div className="luxury-footer-bottom-content">
            <p className="luxury-footer-copyright">
              © {new Date().getFullYear()} {contactInfo.name}. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer