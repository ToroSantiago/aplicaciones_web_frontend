/**
 * Gestor de Service Worker + Push Notifications
 */

export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers no soportados en este navegador');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    });

    console.log('✓ Service Worker registrado:', registration);

    // Detectar updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Nueva versión disponible
            console.log('✓ Nueva versión del app disponible');
            // Opcional: mostrar toast al usuario
            window.dispatchEvent(new CustomEvent('swUpdate', { detail: registration }));
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('✗ Error registrando Service Worker:', error);
    return null;
  }
};

/**
 * Solicitar permisos de Push Notifications
 */
export const requestPushPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('Notifications no soportadas');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

/**
 * Suscribirse a push notifications
 * Retorna la suscripción para enviarla al backend
 */
export const subscribeToPushNotifications = async () => {
  try {
    // Primero registrar el SW
    const registration = await registerServiceWorker();
    if (!registration) {
      console.error('No se pudo registrar el Service Worker');
      return null;
    }

    // Pedir permisos
    const hasPermission = await requestPushPermission();
    if (!hasPermission) {
      console.warn('Permisos de notificación rechazados');
      return null;
    }

    // Obtener/crear suscripción
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Necesitas la VAPID public key del servidor
      const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error('VAPID_PUBLIC_KEY no configurada en .env');
        return null;
      }

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
    }

    console.log('✓ Suscrito a push notifications');
    return subscription;
  } catch (error) {
    console.error('✗ Error suscribiendo a push:', error);
    return null;
  }
};

/**
 * Convertir VAPID public key a Uint8Array
 */
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};