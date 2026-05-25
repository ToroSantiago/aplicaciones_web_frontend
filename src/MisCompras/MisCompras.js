"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Package, Calendar, CreditCard, ChevronDown, ChevronUp } from "lucide-react"
import { API_BASE_URL, fetchAuth, getCurrentUser, isCliente } from "../auth/auth"
import "./MisCompras.css"

/**
 * Página "Mis compras" — historial del cliente logueado.
 * Pega a GET /edp/mis-ventas (auth:sanctum).
 *
 * Si no hay sesión o el rol no es Cliente, mostramos un mensaje y un
 * botón para ir al login. No bloqueamos el render por seguridad —
 * el endpoint del backend ya valida el token.
 */
const MisCompras = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null) // { cliente, ventas: [] }
  const [expandedId, setExpandedId] = useState(null)

  const user = getCurrentUser()
  const authedOk = !!user && isCliente()

  useEffect(() => {
    if (!authedOk) {
      setLoading(false)
      return
    }

    let cancelled = false

    const load = async () => {
      try {
        const res = await fetchAuth(`${API_BASE_URL}/mis-ventas`)
        if (res.status === 401) {
          // fetchAuth ya limpió la sesión; mostramos mensaje y redirigimos
          if (!cancelled) {
            setError("Tu sesión expiró. Volvé a iniciar sesión.")
            setLoading(false)
          }
          return
        }

        const body = await res.json()
        if (!cancelled) {
          if (res.ok && body.success) {
            setData(body.data)
          } else {
            setError(body.message || `Error ${res.status} al cargar tus compras`)
          }
          setLoading(false)
        }
      } catch (e) {
        console.error(e)
        if (!cancelled) {
          setError("No se pudo conectar con el servidor.")
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [authedOk])

  // -------- Render helpers --------

  const formatPrice = (n) =>
    Number.parseFloat(n).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

  const formatFecha = (iso) => {
    // El backend manda 'YYYY-MM-DD HH:mm:ss' → convertimos a Date para
    // formatear según locale del navegador.
    try {
      const d = new Date(iso.replace(" ", "T"))
      return d.toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return iso
    }
  }

  const estadoBadge = (estado) => {
    const cls =
      estado === "completada"
        ? "mc-badge-success"
        : estado === "pendiente"
          ? "mc-badge-warning"
          : "mc-badge-danger"
    return <span className={`mc-badge ${cls}`}>{estado}</span>
  }

  // -------- Early returns --------

  if (!authedOk) {
    return (
      <div className="mc-container">
        <div className="mc-card mc-empty">
          <h2>Tenés que iniciar sesión</h2>
          <p>Para ver tu historial de compras necesitás una cuenta de cliente.</p>
          <button className="mc-btn-primary" onClick={() => navigate("/authForm")}>
            Iniciar sesión
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mc-container">
        <div className="mc-card mc-empty">
          <div className="mc-spinner" />
          <p>Cargando tus compras...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mc-container">
        <div className="mc-card mc-empty">
          <p className="mc-error">{error}</p>
          <button className="mc-btn-primary" onClick={() => navigate("/")}>
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  const ventas = data?.ventas ?? []

  if (ventas.length === 0) {
    return (
      <div className="mc-container">
        <div className="mc-card mc-empty">
          <Package size={48} className="mc-empty-icon" />
          <h2>Todavía no tenés compras</h2>
          <p>Cuando hagas tu primera compra, va a aparecer acá.</p>
          <button className="mc-btn-primary" onClick={() => navigate("/")}>
            Ver el catálogo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mc-container">
      <div className="mc-header">
        <h1 className="mc-title">Mis compras</h1>
        <p className="mc-subtitle">
          Hola {data.cliente.nombre} — {ventas.length}{" "}
          {ventas.length === 1 ? "compra" : "compras"} en total.
        </p>
      </div>

      <div className="mc-list">
        {ventas.map((venta) => {
          const isOpen = expandedId === venta.id
          return (
            <div key={venta.id} className="mc-venta">
              <button
                className="mc-venta-summary"
                onClick={() => setExpandedId(isOpen ? null : venta.id)}
              >
                <div className="mc-venta-summary-left">
                  <div className="mc-venta-id">Compra #{venta.id}</div>
                  <div className="mc-venta-meta">
                    <span><Calendar size={14} /> {formatFecha(venta.fecha)}</span>
                    {venta.metodo_pago && (
                      <span><CreditCard size={14} /> {venta.metodo_pago}</span>
                    )}
                    <span>{venta.cantidad_items} item(s)</span>
                    {estadoBadge(venta.estado)}
                  </div>
                </div>
                <div className="mc-venta-summary-right">
                  <div className="mc-venta-total">${formatPrice(venta.total)}</div>
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </button>

              {isOpen && (
                <div className="mc-venta-items">
                  {venta.items.map((it, i) => (
                    <div key={i} className="mc-item">
                      <div className="mc-item-thumb">
                        {it.imagen ? (
                          <img src={it.imagen} alt={it.perfume} />
                        ) : (
                          <Package size={28} />
                        )}
                      </div>
                      <div className="mc-item-info">
                        <div className="mc-item-name">
                          {it.perfume} <small>— {it.marca}</small>
                        </div>
                        <div className="mc-item-meta">
                          {it.volumen}ml · cantidad: {it.cantidad}
                        </div>
                      </div>
                      <div className="mc-item-price">
                        <div className="mc-item-unit">${formatPrice(it.precio_unitario)} c/u</div>
                        <div className="mc-item-subtotal">${formatPrice(it.subtotal)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MisCompras
