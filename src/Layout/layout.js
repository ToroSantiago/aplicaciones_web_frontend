import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Body from '../Body/Body';
import AuthForm from '../AuthForms/authForms';
import RegisterForm from '../RegisterForm/registerForm';

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
    <>
      <Navbar />
      {renderContent()}
    </>
  );
};

export default Layout;
