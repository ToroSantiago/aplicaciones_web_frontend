import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout/layout';
import Footer from './Footer/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<Layout />} />
        <Route path="/footer" element={<Footer />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default App;
