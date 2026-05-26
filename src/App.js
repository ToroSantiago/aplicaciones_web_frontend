import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout/layout';
import { registerServiceWorker } from './serviceWorkerManager';
import { useDiscountNotifications } from './hooks/useDiscountNotifications';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  useEffect(() => {
    const initPWA = async () => {
      await registerServiceWorker();
    };

    initPWA();
  }, []);

  // Hook para notificaciones de descuentos nuevos
  useDiscountNotifications();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<Layout />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;