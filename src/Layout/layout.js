import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Body from '../Body/Body';
import AuthForm from '../AuthForms/authForms';
import RegisterForm from '../RegisterForm/registerForm';
import Success from '../pages/Success';
import Failed from '../pages/Failed';
import MisCompras from '../MisCompras/MisCompras';
import Footer from '../Footer/Footer';
import Home from '../Landing/home';

const Layout = () => {
  const location = useLocation();

  const renderContent = () => {
    switch (location.pathname) {
      case '/':
      case '/home':
        return <Body />;
      case '/inicio':
        return <Home />;
      case '/authForm':
        return <AuthForm />;
      case '/register':
        return <RegisterForm />;
      case '/mis-compras':
        return <MisCompras />;
      case '/success':
        return <Success />;
      case '/failed':
        return <Failed />;
      default:
        return <div className="container mt-5">Página no encontrada</div>;
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="flex-grow-1">
        {renderContent()}
      </div>
      <Footer />
    </div>
  );
};

export default Layout;