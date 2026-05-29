import React from 'react';
import './home.css';
import { useNavigate } from 'react-router-dom';

const AboutSection = () => {
  const navigate = useNavigate();
  return (
    <div className="about-page">

      {/* HERO SECTION */}
      <section className="about-hero">
        <div className="about-overlay"></div>

        <div className="about-content">
          <span className="about-subtitle">
            PERFUMERÍA DE LUJO
          </span>

          <h1 className="about-title">
            Essenza Royale
          </h1>

          <p className="about-description">
            Descubrí perfumes exclusivos que combinan elegancia,
            sofisticación y personalidad. En Essenza Royale
            seleccionamos fragancias únicas para hombres y mujeres
            que buscan destacar con estilo propio.
          </p>

          <button
            onClick={() => navigate("/home")}
            className="about-button"
          >
            Explorar Fragancias
          </button>
        </div>
      </section>

    </div>
  );
};

export default AboutSection;