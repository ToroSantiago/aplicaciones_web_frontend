"use client"

import { useState, useEffect } from "react"
import "./Body.css" // Importar los estilos

const Body = () => {
  const [perfumes, setPerfumes] = useState([])
  const [filteredPerfumes, setFilteredPerfumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Estados para los filtros
  const [filters, setFilters] = useState({
    genero: "",
    precioMin: "",
    precioMax: "",
    volumen: "",
    soloConStock: false,
    marca: "",
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

    // Filtro por precio mínimo
    if (filters.precioMin) {
      filtered = filtered.filter((perfume) => perfume.precio >= Number.parseFloat(filters.precioMin))
    }

    // Filtro por precio máximo
    if (filters.precioMax) {
      filtered = filtered.filter((perfume) => perfume.precio <= Number.parseFloat(filters.precioMax))
    }

    // Filtro por volumen
    if (filters.volumen) {
      filtered = filtered.filter((perfume) => perfume.volumen === Number.parseInt(filters.volumen))
    }

    // Filtro por marca
    if (filters.marca) {
      filtered = filtered.filter((perfume) => perfume.marca.toLowerCase().includes(filters.marca.toLowerCase()))
    }

    // Filtro solo con stock
    if (filters.soloConStock) {
      filtered = filtered.filter((perfume) => perfume.stock > 0)
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
      precioMin: "",
      precioMax: "",
      volumen: "",
      soloConStock: false,
      marca: "",
    })
  }

  const toggleFilterModal = () => {
    setIsFilterOpen(!isFilterOpen)
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
        <label className="luxury-form-label">Precio Mín.</label>
        <input
          type="number"
          className="luxury-form-control"
          placeholder="Precio mínimo"
          value={filters.precioMin}
          onChange={(e) => handleFilterChange("precioMin", e.target.value)}
        />
      </div>

      <div className="luxury-filter-group">
        <label className="luxury-form-label">Precio Máx.</label>
        <input
          type="number"
          className="luxury-form-control"
          placeholder="Precio máximo"
          value={filters.precioMax}
          onChange={(e) => handleFilterChange("precioMax", e.target.value)}
        />
      </div>

      <div className="luxury-filter-group">
        <label className="luxury-form-label">Disponibilidad</label>
        <div
          className="luxury-checkbox-group"
          onClick={() => handleFilterChange("soloConStock", !filters.soloConStock)}
        >
          <input
            className="luxury-checkbox"
            type="checkbox"
            checked={filters.soloConStock}
            onChange={(e) => handleFilterChange("soloConStock", e.target.checked)}
          />
          <label className="luxury-checkbox-label">Solo con stock</label>
        </div>
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
              <span className="filter-icon">⚙️</span>
              Filtros
              <span className="filter-count">
                {Object.values(filters).filter((value) => value !== "" && value !== false).length}
              </span>
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
                      onClick={() => {
                        // Aquí irá la lógica del modal en el futuro
                        console.log("Clicked perfume:", perfume.id)
                      }}
                    >
                      <img
                        src={perfume.imagen_url || "https://via.placeholder.com/400x280/1a1a1a/ffffff?text=Sin+Imagen"}
                        className="luxury-product-image"
                        alt={perfume.nombre}
                      />
                      <div className="luxury-product-body">
                        <div className="luxury-product-header">
                          <h5 className="luxury-product-title">{perfume.nombre}</h5>
                          <h6 className="luxury-product-brand">{perfume.marca}</h6>
                        </div>

                        <p className="luxury-product-description">{perfume.descripcion}</p>

                        <div className="luxury-product-details">
                          <div className="luxury-product-price">${perfume.precio.toLocaleString("es-AR")}</div>

                          <div className="luxury-product-specs">
                            <div className="luxury-spec-item">
                              <span className="luxury-product-label">Volumen</span>
                              <span className="luxury-product-value">{perfume.volumen}ml</span>
                            </div>

                            <div className="luxury-spec-item">
                              <span className="luxury-product-label">Género</span>
                              <span className="luxury-product-value">
                                {perfume.genero === "M" ? "Masculino" : perfume.genero === "F" ? "Femenino" : "Unisex"}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`luxury-stock-info ${
                              perfume.stock > 0 ? "luxury-stock-available" : "luxury-stock-unavailable"
                            }`}
                          >
                            <span className="luxury-product-label">Disponibilidad</span>
                            <div className="luxury-product-value">
                              {perfume.stock > 0 ? `${perfume.stock} unidades` : "Sin stock"}
                            </div>
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
    </div>
  )
}

export default Body
