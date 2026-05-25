/**
 * Helpers de sesión para el SPA.
 *
 * Manejamos el estado del usuario con localStorage + un evento custom
 * 'authChanged' para que componentes como el Navbar puedan reaccionar
 * cuando alguien hace login/logout. Es el mismo patrón que ya usa el
 * carrito con 'cartUpdated', así mantenemos coherencia y evitamos meter
 * Context si todavía no hace falta.
 *
 * Claves en localStorage:
 *   - auth_token: string (token Sanctum)
 *   - user: JSON.stringify del usuario { id, nombre, apellido, email, rol, ... }
 */

const TOKEN_KEY = "auth_token"
const USER_KEY = "user"

// URL base del backend. Centralizada acá: si en el futuro alguien la
// necesita en mas lugares, importamos esta constante en vez de hardcodear.
//
// IMPORTANTE: la API vive bajo el prefijo /edp (definido en bootstrap/app.php
// del backend con apiPrefix). Si REACT_APP_API_URL llega solo con el host,
// le agregamos /edp para evitar que las llamadas caigan en las rutas Blade
// (web.php) y revienten con CSRF mismatch.
const API_URL_RAW =
  process.env.REACT_APP_API_URL ||
  "https://aplicacioneswebbackend-git-dev-torosantiagos-projects.vercel.app/edp"

const ensureApiPrefix = (url) => {
  const clean = url.replace(/\/+$/, "") // sin trailing slash
  if (clean.endsWith("/edp")) return clean
  console.warn(
    `[auth] REACT_APP_API_URL "${url}" no termina en /edp — agrego el prefijo. ` +
      `Considera actualizar el .env para apuntar a .../edp explicitamente.`
  )
  return `${clean}/edp`
}

export const API_BASE_URL = ensureApiPrefix(API_URL_RAW)

/**
 * Devuelve el usuario actual desde localStorage, o null si no hay sesión
 * o si el JSON está corrupto.
 */
export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw || raw === "null" || raw === "undefined") return null
    return JSON.parse(raw)
  } catch (e) {
    console.warn("user en localStorage corrupto, limpiando", e)
    localStorage.removeItem(USER_KEY)
    return null
  }
}

export const getToken = () => localStorage.getItem(TOKEN_KEY) || null

export const isLoggedIn = () => Boolean(getToken() && getCurrentUser())

export const isCliente = () => {
  const u = getCurrentUser()
  return !!u && u.rol === "Cliente"
}

/**
 * Guarda token + usuario y emite el evento authChanged para que el resto
 * de la app (Navbar, etc.) re-renderice.
 */
export const setSession = (token, usuario) => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(usuario))
  emitAuthChange()
}

/**
 * Limpia sesión local. NO llama al backend — quien necesite invalidar el
 * token en Sanctum debe pegarle a /edp/logout antes.
 */
export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  emitAuthChange()
}

/**
 * Cierra sesión: pega a /edp/logout para revocar el token y limpia local.
 * Si el backend falla, igual limpiamos local — el usuario quedaría sin
 * sesión en este device aunque el token siga vivo en backend.
 */
export const logout = async () => {
  const token = getToken()
  if (token) {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
    } catch (e) {
      // No bloqueamos el logout local por un fallo de red.
      console.warn("Fallo el logout en backend, igual limpio sesión local:", e)
    }
  }
  clearSession()
}

/**
 * fetch wrapper que automaticamente agrega Authorization: Bearer <token>.
 * Si la respuesta es 401, limpia la sesión (token vencido o revocado).
 */
export const fetchAuth = async (url, options = {}) => {
  const token = getToken()
  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  }
  // Solo agregamos Content-Type si hay body — para GETs no hace falta.
  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json"
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(url, { ...options, headers })

  if (res.status === 401) {
    // Token inválido o expirado — forzamos logout local.
    clearSession()
  }

  return res
}

// ---------------------------------------------------------------------
// Evento authChanged: notifica a quien escuche que cambió el estado de
// sesión. Los componentes lo usan con window.addEventListener.
// ---------------------------------------------------------------------

const AUTH_EVENT = "authChanged"

const emitAuthChange = () => {
  window.dispatchEvent(new CustomEvent(AUTH_EVENT))
}

export const onAuthChange = (handler) => {
  window.addEventListener(AUTH_EVENT, handler)
  return () => window.removeEventListener(AUTH_EVENT, handler)
}
