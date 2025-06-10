"use client"

import { useState, useEffect } from "react"
import "./Body.css"

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

    // Filtro por volumen
    if (filters.volumen) {
      filtered = filtered.filter((perfume) => perfume.volumen === Number.parseInt(filters.volumen))
    }

    // Filtro por marca
    if (filters.marca) {
      filtered = filtered.filter((perfume) => perfume.marca.toLowerCase().includes(filters.marca.toLowerCase()))
    }

    // Ordenar por precio
    if (filters.ordenPrecio === "menor") {
      filtered.sort((a, b) => a.precio - b.precio)
    } else if (filters.ordenPrecio === "mayor") {
      filtered.sort((a, b) => b.precio - a.precio)
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
    setSelectedVolume(perfume.volumen.toString())
    setIsDetailModalOpen(true)
  }

  const closeDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedPerfume(null)
    setSelectedVolume("")
  }

  // Obtener valores únicos para los filtros
  const getUniqueVolumes = () => {
    const volumes = [...new Set(perfumes.map((p) => p.volumen))]
    return volumes.sort((a, b) => a - b)
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

  // Simular diferentes tamaños para el perfume seleccionado
  const getPerfumeVariants = (perfume) => {
    if (!perfume) return []

    const basePrice = perfume.precio
    const baseStock = perfume.stock

    return [
      { volumen: 30, precio: Math.round(basePrice * 0.6), stock: Math.max(0, baseStock - 2) },
      { volumen: 50, precio: Math.round(basePrice * 0.8), stock: Math.max(0, baseStock - 1) },
      { volumen: 75, precio: basePrice, stock: baseStock },
      { volumen: 100, precio: Math.round(basePrice * 1.3), stock: Math.max(0, baseStock + 2) },
    ]
  }

  const getSelectedVariant = () => {
    if (!selectedPerfume || !selectedVolume) return null
    const variants = getPerfumeVariants(selectedPerfume)
    return variants.find((v) => v.volumen.toString() === selectedVolume)
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
        <label className="luxury-form-label">Volumen</label>
        <select
          className="luxury-form-control"
          value={filters.volumen}
          onChange={(e) => handleFilterChange("volumen", e.target.value)}
        >
          <option value="">Todos los volúmenes</option>
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
              <span className="filter-icon"></span>
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
                      className="luxury-product-card luxury-product-clickable"
                      onClick={() => openDetailModal(perfume)}
                    >
                      <div className="luxury-product-image-container">
                        <img
                          src={perfume.imagen_url || "https://via.placeholder.com/400x400/1a1a1a/ffffff?text=Sin+Imagen"}
                          className="luxury-product-image"
                          alt={perfume.nombre}
                        />
                      </div>
                      <div className="luxury-product-body">
                        <div className="luxury-product-header">
                          <h5 className="luxury-product-title">
                            {perfume.nombre}
                          </h5>
                          <h6 className="luxury-product-brand">
                            {perfume.marca}
                          </h6>
                        </div>

                        <p className="luxury-product-description">
                          {perfume.descripcion}
                        </p>

                        <div className="luxury-product-gender">
                          <span className="luxury-product-value">
                            {getGenderLabel(perfume.genero)}
                          </span>
                        </div>

                        <div className="luxury-product-price">
                          ${perfume.precio.toLocaleString("es-AR")}
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
              <h3 className="luxury-detail-modal-title">{selectedPerfume.nombre} de {selectedPerfume.marca}</h3>
              <button className="luxury-detail-modal-close" onClick={closeDetailModal}>
                ✕
              </button>
            </div>
            <div className="luxury-detail-modal-content">
              <div className="luxury-detail-modal-image">
                <img
                  src={
                    selectedPerfume.imagen_url || "https://via.placeholder.com/400x400/1a1a1a/ffffff?text=Sin+Imagen"
                  }
                  alt={selectedPerfume.nombre}
                  className="luxury-detail-image"
                />
              </div>
              <div className="luxury-detail-modal-info">
                <div className="luxury-detail-volume-section">
                  <label className="luxury-detail-label">🧴 Seleccionar Tamaño</label>
                  <select
                    className="luxury-detail-volume-select"
                    value={selectedVolume}
                    onChange={(e) => setSelectedVolume(e.target.value)}
                  >
                    {getPerfumeVariants(selectedPerfume).map((variant) => (
                      <option key={variant.volumen} value={variant.volumen}>
                        {variant.volumen}ml - ${variant.precio.toLocaleString("es-AR")}
                      </option>
                    ))}
                  </select>
                </div>

                {getSelectedVariant() && (
                  <div className="luxury-detail-selected-info">
                    <div className="luxury-detail-price">${getSelectedVariant().precio.toLocaleString("es-AR")}</div>

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
                    >
                      {getSelectedVariant().stock === 0 ? "Sin Stock" : "Agregar al Carrito"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Body
