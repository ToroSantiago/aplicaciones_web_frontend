import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Body from '../Body/Body';
import AuthForm from '../AuthForms/authForms';
import RegisterForm from '../RegisterForm/registerForm';
import Footer from '../Footer/Footer';

const Layout = () => {
  const location = useLocation();

  const renderContent = () => {
    switch (location.pathname) {
      case '/':
      case '/home':
        return <Body />;
      case '/authForm':
        return <AuthForm />;
      case '/register':
        return <RegisterForm />;
      default:
        return <div className="container mt-5">Página no encontrada</div>;
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100"> {/* Asegura que el contenedor tenga altura suficiente */}
      <Navbar />
      <div className="flex-grow-1"> {/* Este div hace que el contenido ocupe el espacio disponible */}
        {renderContent()}
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
