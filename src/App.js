import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar/Navbar';
import Footer from './Footer/Footer';
import Body from './Body/Body';
import Carrusel from './Carrusel/Carrusel';
import FormLogin from './FormLogin/FormLogin';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<><Carrusel /><Body /></>} />
        <Route path="/productos" element={<h2>Productos</h2>} />
        <Route path="/contacto" element={<h2>Contacto</h2>} />
        <Route path="/login" element={<FormLogin />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default App;
