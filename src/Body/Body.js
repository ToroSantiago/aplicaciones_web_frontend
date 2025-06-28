"use client"

import { useState, useEffect } from "react"
import "./Body.css"
import { addToCart } from "../Carrito/carrito"

const Body = () => {
  const [perfumes, setPerfumes] = useState([])
  const [filteredPerfumes, setFilteredPerfumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Estados para el modal de detalles
  const [selectedPerfume, setSelectedPerfume] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedVolume, setSelectedVolume] = useState("")

  // Estados para los filtros
  const [filters, setFilters] = useState({
    genero: "",
    volumen: "",
    marca: "",
    ordenPrecio: "",
  })

  // Reemplaza esta URL con la URL de tu backend en Vercel
  const API_URL = "https://aplicacioneswebbackend-git-dev-torosantiagos-projects.vercel.app/edp"

  useEffect(() => {
    fetchPerfumes()
  }, [])

  // Aplicar filtros cuando cambien los filtros o los perfumes
  useEffect(() => {
    applyFilters()
  }, [filters, perfumes])

  const fetchPerfumes = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/paginated`)

      if (!response.ok) {
        throw new Error("Error al obtener los perfumes")
      }

      const data = await response.json()

      if (data.success) {
        setPerfumes(data.data)
      } else {
        throw new Error(data.message || "Error desconocido")
      }
    } catch (err) {
      setError(err.message)
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...perfumes]

    // Filtro por género
    if (filters.genero) {
      filtered = filtered.filter((perfume) => perfume.genero === filters.genero)
    }

    // Filtro por volumen - ahora filtramos por variantes disponibles
    if (filters.volumen) {
      filtered = filtered.filter(
        (perfume) => perfume.variantes && perfume.variantes.some((v) => v.volumen === Number.parseInt(filters.volumen)),
      )
    }

    // Filtro por marca
    if (filters.marca) {
      filtered = filtered.filter((perfume) => perfume.marca.toLowerCase().includes(filters.marca.toLowerCase()))
    }

    // Ordenar por precio (usando precio mínimo)
    if (filters.ordenPrecio === "menor") {
      filtered.sort((a, b) => (a.precio_minimo || 0) - (b.precio_minimo || 0))
    } else if (filters.ordenPrecio === "mayor") {
      filtered.sort((a, b) => (b.precio_maximo || 0) - (a.precio_maximo || 0))
    }

    setFilteredPerfumes(filtered)
  }

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      genero: "",
      volumen: "",
      marca: "",
      ordenPrecio: "",
    })
  }

  const toggleFilterModal = () => {
    setIsFilterOpen(!isFilterOpen)
  }

  // Funciones para el modal de detalles
  const openDetailModal = (perfume) => {
    setSelectedPerfume(perfume)
    // Seleccionar el primer volumen disponible con stock
    const primeraVarianteConStock = perfume.variantes?.find((v) => v.stock > 0)
    setSelectedVolume(primeraVarianteConStock ? primeraVarianteConStock.volumen.toString() : "")
    setIsDetailModalOpen(true)
  }

  const closeDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedPerfume(null)
    setSelectedVolume("")
  }

  // Obtener valores únicos para los filtros
  const getUniqueVolumes = () => {
    const volumes = new Set()
    perfumes.forEach((perfume) => {
      if (perfume.variantes) {
        perfume.variantes.forEach((v) => volumes.add(v.volumen))
      }
    })
    return Array.from(volumes).sort((a, b) => a - b)
  }

  const getUniqueBrands = () => {
    const brands = [...new Set(perfumes.map((p) => p.marca))]
    return brands.sort()
  }

  const getGenderLabel = (genero) => {
    switch (genero) {
      case "M":
        return "Masculino"
      case "F":
        return "Femenino"
      case "U":
        return "Unisex"
      default:
        return genero
    }
  }

  const getSelectedVariant = () => {
    if (!selectedPerfume || !selectedVolume || !selectedPerfume.variantes) return null
    return selectedPerfume.variantes.find((v) => v.volumen.toString() === selectedVolume)
  }

  // Componente de filtros reutilizable
  const FilterContent = () => (
    <>
      <div className="luxury-filter-group">
        <label className="luxury-form-label">Género</label>
        <select
          className="luxury-form-control"
          value={filters.genero}
          onChange={(e) => handleFilterChange("genero", e.target.value)}
        >
          <option value="">Todos los géneros</option>
          <option value="M">Masculino</option>
          <option value="F">Femenino</option>
          <option value="U">Unisex</option>
        </select>
      </div>

      <div className="luxury-filter-group">
        <label className="luxury-form-label">Marca</label>
        <select
          className="luxury-form-control"
          value={filters.marca}
          onChange={(e) => handleFilterChange("marca", e.target.value)}
        >
          <option value="">Todas las marcas</option>
          {getUniqueBrands().map((marca) => (
            <option key={marca} value={marca}>
              {marca}
            </option>
          ))}
        </select>
      </div>

      <div className="luxury-filter-group">
        <label className="luxury-form-label">Tamaño</label>
        <select
          className="luxury-form-control"
          value={filters.volumen}
          onChange={(e) => handleFilterChange("volumen", e.target.value)}
        >
          <option value="">Todos los tamaños</option>
          {getUniqueVolumes().map((volumen) => (
            <option key={volumen} value={volumen}>
              {volumen}ml
            </option>
          ))}
        </select>
      </div>

      <div className="luxury-filter-group">
        <label className="luxury-form-label">Ordenar por precio</label>
        <select
          className="luxury-form-control"
          value={filters.ordenPrecio}
          onChange={(e) => handleFilterChange("ordenPrecio", e.target.value)}
        >
          <option value="">Sin ordenar</option>
          <option value="menor">Menor a mayor precio</option>
          <option value="mayor">Mayor a menor precio</option>
        </select>
      </div>

      <div className="luxury-filter-actions">
        <button className="luxury-clear-button" onClick={clearFilters}>
          Limpiar Filtros
        </button>
        <div className="luxury-result-text">
          {filteredPerfumes.length} de {perfumes.length} perfumes
        </div>
      </div>
    </>
  )

  if (loading) {
    return (
      <div className="luxury-body-container">
        <div className="container">
          <div className="luxury-loading">
            <div className="luxury-spinner"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="luxury-body-container">
        <div className="container">
          <div className="luxury-alert luxury-alert-error">Error: {error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="luxury-body-container">
      <div className="luxury-layout">
        {/* Sidebar de filtros para desktop */}
        <aside className="luxury-sidebar">
          <div className="luxury-sidebar-header">
            <h3 className="luxury-sidebar-title">Filtros</h3>
          </div>
          <div className="luxury-sidebar-content">
            <FilterContent />
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="luxury-main-content">
          {/* Botón de filtros para móvil */}
          <div className="luxury-mobile-filter-button">
            <button className="luxury-filter-toggle-btn" onClick={toggleFilterModal}>
              <span className="filter-icon">🔍</span>
              Filtros
              <span className="filter-count">{Object.values(filters).filter((value) => value !== "").length}</span>
            </button>
          </div>

          {/* Resultados */}
          <div className="luxury-products-container">
            <div className="row g-3 g-md-4">
              {filteredPerfumes.length === 0 ? (
                <div className="col-12">
                  <div className="luxury-alert">
                    {perfumes.length === 0
                      ? "No hay perfumes disponibles en este momento."
                      : "No hay perfumes que coincidan con los filtros seleccionados."}
                  </div>
                </div>
              ) : (
                filteredPerfumes.map((perfume) => (
                  <div key={perfume.id} className="col-xl-4 col-lg-6 col-md-6 col-mobile-6">
                    <div
                      className={`luxury-product-card ${perfume.hay_stock ? "luxury-product-clickable" : "luxury-product-disabled"}`}
                      onClick={perfume.hay_stock ? () => openDetailModal(perfume) : undefined}
                    >
                      <div className="luxury-product-image-container">
                        <img
                          src={
                            perfume.imagen_url || "https://via.placeholder.com/400x400/1a1a1a/ffffff?text=Sin+Imagen"
                          }
                          className="luxury-product-image"
                          alt={perfume.nombre}
                        />
                      </div>
                      <div className="luxury-product-body">
                        <div className="luxury-product-header">
                          <h5 className="luxury-product-title">{perfume.nombre}</h5>
                          <h6 className="luxury-product-brand">{perfume.marca}</h6>
                        </div>

                        <p className="luxury-product-description">{perfume.descripcion}</p>

                        <div className="luxury-product-badges">
                          <div className="luxury-product-gender">
                            <span className="luxury-product-value">{getGenderLabel(perfume.genero)}</span>
                          </div>

                          <div className="luxury-product-price">
                            <span className="luxury-price-value">
                              {perfume.precio_minimo === perfume.precio_maximo
                                ? `$${Number.parseFloat(perfume.precio_minimo).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                : `$${Number.parseFloat(perfume.precio_minimo).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                            </span>
                          </div>

                          <div
                            className={`luxury-stock-info ${perfume.hay_stock ? "luxury-stock-available" : "luxury-stock-unavailable"}`}
                          >
                            <span className="luxury-stock-icon">{perfume.hay_stock ? "✅" : "❌"}</span>
                            <span className="luxury-stock-text">{perfume.hay_stock ? "Disponible" : "Agotado"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal de filtros para móvil */}
      {isFilterOpen && (
        <div className="luxury-filter-modal-overlay" onClick={toggleFilterModal}>
          <div className="luxury-filter-modal" onClick={(e) => e.stopPropagation()}>
            <div className="luxury-filter-modal-header">
              <h3 className="luxury-filter-modal-title">Filtros</h3>
              <button className="luxury-filter-modal-close" onClick={toggleFilterModal}>
                ✕
              </button>
            </div>
            <div className="luxury-filter-modal-content">
              <FilterContent />
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles del perfume */}
      {isDetailModalOpen && selectedPerfume && (
        <div className="luxury-detail-modal-overlay" onClick={closeDetailModal}>
          <div className="luxury-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="luxury-detail-modal-header">
              <h3 className="luxury-detail-modal-title">
                {selectedPerfume.nombre} de {selectedPerfume.marca}
              </h3>
              <button className="luxury-detail-modal-close" onClick={closeDetailModal}>
                ✕
              </button>
            </div>
            <div className="luxury-detail-modal-content">
              {/* Imagen centrada arriba */}
              <div className="luxury-detail-modal-image-top">
                <img
                  src={
                    selectedPerfume.imagen_url || "https://via.placeholder.com/400x400/1a1a1a/ffffff?text=Sin+Imagen"
                  }
                  alt={selectedPerfume.nombre}
                  className="luxury-detail-image"
                />
              </div>

              {/* Contenido principal: descripción a la izquierda, opciones a la derecha */}
              <div className="luxury-detail-main-content">
                {/* Descripción a la izquierda */}
                <div className="luxury-detail-description-section">
                  <div className="luxury-detail-product-info">
                    <h3 className="luxury-detail-title">{selectedPerfume.nombre}</h3>
                    <h4 className="luxury-detail-brand">{selectedPerfume.marca}</h4>
                    <div className="luxury-detail-gender-badge">
                      <span className="luxury-detail-gender">{getGenderLabel(selectedPerfume.genero)}</span>
                    </div>
                  </div>

                  <div className="luxury-detail-description">
                    <h5 className="luxury-detail-description-title">Descripción</h5>
                    <p className="luxury-detail-description-text">
                      {selectedPerfume.descripcion || "Descripción no disponible para este perfume."}
                    </p>
                  </div>
                </div>

                {/* Opciones del carrito a la derecha */}
                <div className="luxury-detail-cart-section">
                  <div className="luxury-detail-volume-section">
                    <label className="luxury-detail-label">🧴 Seleccionar Tamaño</label>
                    <select
                      className="luxury-detail-volume-select"
                      value={selectedVolume}
                      onChange={(e) => setSelectedVolume(e.target.value)}
                    >
                      <option value="" disabled>
                        Selecciona un tamaño
                      </option>
                      {selectedPerfume.variantes?.map((variant) => (
                        <option key={variant.volumen} value={variant.volumen} disabled={variant.stock === 0}>
                          {variant.volumen}ml - $
                          {Number.parseFloat(variant.precio).toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                          {variant.stock === 0 ? " (Sin stock)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {getSelectedVariant() && (
                    <div className="luxury-detail-selected-info">
                      <div className="luxury-detail-price">
                        $
                        {Number.parseFloat(getSelectedVariant().precio).toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>

                      <div
                        className={`luxury-detail-stock ${getSelectedVariant().stock > 0 ? "luxury-detail-stock-available" : "luxury-detail-stock-unavailable"}`}
                      >
                        <span className="luxury-detail-label">📦 Disponibilidad</span>
                        <span className="luxury-detail-value">
                          {getSelectedVariant().stock > 0 ? `${getSelectedVariant().stock} unidades` : "Sin stock"}
                        </span>
                      </div>

                      <button
                        className={`luxury-detail-add-button ${getSelectedVariant().stock === 0 ? "luxury-detail-add-button-disabled" : ""}`}
                        disabled={getSelectedVariant().stock === 0}
                        onClick={() => {
                          if (getSelectedVariant().stock > 0) {
                            // Crear un producto con el precio correcto según el volumen seleccionado
                            const productToAdd = {
                              ...selectedPerfume,
                              precio: Number.parseFloat(getSelectedVariant().precio), // Asegurar que sea número
                              volumen: getSelectedVariant().volumen,
                              stock: getSelectedVariant().stock,
                            }

                            // Agregar al carrito usando la función importada
                            addToCart(productToAdd, 1, Number.parseInt(selectedVolume))

                            // Mostrar mensaje de confirmación más detallado
                            alert(`✅ ${selectedPerfume.nombre} (${selectedVolume}ml) agregado al carrito exitosamente`)

                            // Cerrar el modal
                            closeDetailModal()
                          }
                        }}
                      >
                        {getSelectedVariant().stock === 0 ? "Sin Stock" : "Agregar al Carrito"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Body
