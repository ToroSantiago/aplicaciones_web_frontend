import React from "react";

const Footer = () => {
    return (
        <div className="social-icons text-center bg-dark py-3">
            <a href="#" target="_blank" rel="noopener noreferrer" className="text-white me-3">
                <i className="fab fa-facebook fa-2x"></i>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="text-white me-3">
                <i className="fab fa-instagram fa-2x"></i>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="text-white me-3">
                <i className="fab fa-youtube fa-2x"></i>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="text-white me-3">
                <i className="fab fa-whatsapp fa-2x"></i>
            </a>
        </div>
    );
};

export default Footer;
