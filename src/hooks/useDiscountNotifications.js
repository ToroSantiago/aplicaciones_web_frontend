import { useEffect, useRef } from 'react';

/**
 * Hook que verifica cada 30 segundos si hay descuentos nuevos.
 * Si el usuario aún no decidió, solicita permisos automáticamente.
 */
export const useDiscountNotifications = () => {
  const notifiedTimestampRef = useRef(
    parseInt(localStorage.getItem('last_notified_discount_time') || '0', 10)
  );

  useEffect(() => {
    if (!('Notification' in window)) {
      console.warn('Notificaciones no soportadas en este navegador');
      return;
    }

    let interval = null;

    const checkNewDiscounts = async () => {
      try {
        const response = await fetch(
          'https://essenzaroyalebackend.vercel.app/edp/descuentos',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          console.error('Error fetching descuentos:', response.status);
          return;
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          data.data.forEach((descuento) => {
            const descuentoTime = new Date(descuento.created_at).getTime();

            if (descuentoTime > notifiedTimestampRef.current) {
              notifiedTimestampRef.current = descuentoTime;

              localStorage.setItem(
                'last_notified_discount_time',
                descuentoTime.toString()
              );

              const variante = descuento.variantes?.[0];
              const perfume = variante?.perfume;
              const volumen = variante?.volumen;
              const porcentaje = descuento.porcentaje;

              const title = '¡Nuevo Descuento!';
              const body = perfume
                ? `${perfume.nombre} - ${volumen}ml: ${porcentaje}% OFF`
                : `Descuento del ${porcentaje}%`;

              new Notification(title, {
                body,
                icon: '/icon-192.png',
                badge: '/badge-72.png',
                tag: `descuento-${descuento.id}`,
                requireInteraction: false,
              });

              console.log(`✓ Notificación de descuento enviada: ${title}`);
            }
          });
        }
      } catch (error) {
        console.error('Error verificando descuentos:', error);
      }
    };

    const startPolling = () => {
      if (interval) return;

      console.log('✓ Iniciando monitoreo de descuentos');

      checkNewDiscounts();
      interval = setInterval(checkNewDiscounts, 30000);
    };

    const init = async () => {
      // ya autorizado → arrancar normal
      if (Notification.permission === 'granted') {
        startPolling();
        return;
      }

      // evitar reload infinito
      const alreadyReloaded = sessionStorage.getItem('notif_reload_done');

      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
          console.log('✓ Permisos de notificación concedidos');

          if (!alreadyReloaded) {
            sessionStorage.setItem('notif_reload_done', 'true');
            window.location.reload();
          }

          return;
        }
      }
    };

    init();

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);
};