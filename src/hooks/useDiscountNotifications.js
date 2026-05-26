import { useEffect, useRef } from 'react';

/**
 * Hook que verifica cada 30 segundos si hay descuentos nuevos
 * Sin necesidad de endpoint dedicado en el backend.
 * 
 * Almacena en localStorage el timestamp del último descuento notificado.
 */
export const useDiscountNotifications = () => {
  const notifiedTimestampRef = useRef(
    parseInt(localStorage.getItem('last_notified_discount_time') || '0', 10)
  );

  useEffect(() => {
    // Solo funciona si el navegador soporta Notifications
    if (!('Notification' in window)) {
      console.warn('Notificaciones no soportadas en este navegador');
      return;
    }

    // Solo si el usuario ya otorgó permisos
    if (Notification.permission !== 'granted') {
      return;
    }

    const checkNewDiscounts = async () => {
      try {
        // Traemos TODOS los descuentos
        const response = await fetch(
          `${'https://essenzaroyalebackend.vercel.app/edp'}/descuentos`,
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

        if (data.success && data.data && Array.isArray(data.data)) {
          // Recorrer descuentos y notificar los NUEVOS
          data.data.forEach((descuento) => {
            // Convertir created_at a timestamp
            const descuentoTime = new Date(descuento.created_at).getTime();

            // Si es más nuevo que el último que notificamos, notificar
            if (descuentoTime > notifiedTimestampRef.current) {
              // Actualizar el timestamp
              notifiedTimestampRef.current = descuentoTime;
              localStorage.setItem(
                'last_notified_discount_time',
                descuentoTime.toString()
              );

              // Construir el mensaje
              const variante = descuento.variantes?.[0];
              const perfume = variante?.perfume;
              const volumen = variante?.volumen;
              const porcentaje = descuento.porcentaje;

              const title = '¡Nuevo Descuento!';
              const body = perfume
                ? `${perfume.nombre} - ${volumen}ml: ${porcentaje}% OFF`
                : `Descuento del ${porcentaje}%`;

              // Mostrar notificación
              new Notification(title, {
                body: body,
                icon: '/icon-192.png',
                badge: '/badge-72.png',
                tag: `descuento-${descuento.id}`,
                requireInteraction: false,
                actions: [
                  { action: 'open', title: 'Ver detalles' },
                  { action: 'close', title: 'Descartar' }
                ]
              });

              console.log(`✓ Notificación de descuento enviada: ${title}`);
            }
          });
        }
      } catch (error) {
        console.error('Error verificando descuentos:', error);
      }
    };

    // Verificar al cargar el componente
    checkNewDiscounts();

    // Verificar cada 30 segundos
    const interval = setInterval(checkNewDiscounts, 30000);

    // Limpiar interval al desmontar
    return () => clearInterval(interval);
  }, []);
};