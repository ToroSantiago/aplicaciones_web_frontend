import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout/layout';
import { registerServiceWorker } from './serviceWorkerManager';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  useEffect(() => {
    // Registrar Service Worker para PWA + caché
    const initPWA = async () => {
      await registerServiceWorker();
    };

    initPWA();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<Layout />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;