import React, { useState, useEffect } from "react";
import "./Body.css"; // Importar los estilos

const Body = () => {
    const [perfumes, setPerfumes] = useState([]);
    const [filteredPerfumes, setFilteredPerfumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
    
    // Estados para los filtros
    const [filters, setFilters] = useState({
        genero: '',
        precioMin: '',
        precioMax: '',
        volumen: '',
        soloConStock: false,
        marca: ''
    });

    // Reemplaza esta URL con la URL de tu backend en Vercel
    const API_URL = 'https://aplicacioneswebbackend-git-dev-torosantiagos-projects.vercel.app/edp';

    // Detectar si es dispositivo móvil
    useEffect(() => {
        const checkIfMobile = () => {
            setIsFilterCollapsed(window.innerWidth <= 768);
        };
        
        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);
        
        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    useEffect(() => {
        fetchPerfumes();
    }, []);

    // Aplicar filtros cuando cambien los filtros o los perfumes
    useEffect(() => {
        applyFilters();
    }, [filters, perfumes]);

    const fetchPerfumes = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/paginated`);
            
            if (!response.ok) {
                throw new Error('Error al obtener los perfumes');
            }
            
            const data = await response.json();
            
            if (data.success) {
                setPerfumes(data.data);
            } else {
                throw new Error(data.message || 'Error desconocido');
            }
        } catch (err) {
            setError(err.message);
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...perfumes];

        // Filtro por género
        if (filters.genero) {
            filtered = filtered.filter(perfume => perfume.genero === filters.genero);
        }

        // Filtro por precio mínimo
        if (filters.precioMin) {
            filtered = filtered.filter(perfume => perfume.precio >= parseFloat(filters.precioMin));
        }

        // Filtro por precio máximo
        if (filters.precioMax) {
            filtered = filtered.filter(perfume => perfume.precio <= parseFloat(filters.precioMax));
        }

        // Filtro por volumen
        if (filters.volumen) {
            filtered = filtered.filter(perfume => perfume.volumen === parseInt(filters.volumen));
        }

        // Filtro por marca
        if (filters.marca) {
            filtered = filtered.filter(perfume => 
                perfume.marca.toLowerCase().includes(filters.marca.toLowerCase())
            );
        }

        // Filtro solo con stock
        if (filters.soloConStock) {
            filtered = filtered.filter(perfume => perfume.stock > 0);
        }

        setFilteredPerfumes(filtered);
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            genero: '',
            precioMin: '',
            precioMax: '',
            volumen: '',
            soloConStock: false,
            marca: ''
        });
    };

    const toggleFilterCollapse = () => {
        setIsFilterCollapsed(!isFilterCollapsed);
    };

    // Obtener valores únicos para los filtros
    const getUniqueVolumes = () => {
        const volumes = [...new Set(perfumes.map(p => p.volumen))];
        return volumes.sort((a, b) => a - b);
    };

    const getUniqueBrands = () => {
        const brands = [...new Set(perfumes.map(p => p.marca))];
        return brands.sort();
    };

    if (loading) {
        return (
            <div className="luxury-body-container">
                <div className="container">
                    <div className="luxury-loading">
                        <div className="luxury-spinner"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="luxury-body-container">
                <div className="container">
                    <div className="luxury-alert luxury-alert-error">
                        Error: {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="luxury-body-container">
            <div className="container">
                {/* Panel de Filtros */}
                <div className="luxury-filter-card">
                    <div className="luxury-filter-header" onClick={toggleFilterCollapse}>
                        <h5 className="luxury-filter-title">Filtros de Búsqueda</h5>
                        <span className={`luxury-filter-toggle ${isFilterCollapsed ? 'collapsed' : ''}`}>
                            ▼
                        </span>
                    </div>
                    <div className={`luxury-filter-body ${isFilterCollapsed ? 'collapsed' : ''}`}>
                        <div className="row g-4">
                            <div className="col-md-2 col-sm-6">
                                <label className="luxury-form-label">Género</label>
                                <select 
                                    className="luxury-form-control"
                                    value={filters.genero}
                                    onChange={(e) => handleFilterChange('genero', e.target.value)}
                                >
                                    <option value="">Todos</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                    <option value="U">Unisex</option>
                                </select>
                            </div>
                            
                            <div className="col-md-2 col-sm-6">
                                <label className="luxury-form-label">Marca</label>
                                <select 
                                    className="luxury-form-control"
                                    value={filters.marca}
                                    onChange={(e) => handleFilterChange('marca', e.target.value)}
                                >
                                    <option value="">Todas las marcas</option>
                                    {getUniqueBrands().map(marca => (
                                        <option key={marca} value={marca}>{marca}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-2 col-sm-6">
                                <label className="luxury-form-label">Volumen (ml)</label>
                                <select 
                                    className="luxury-form-control"
                                    value={filters.volumen}
                                    onChange={(e) => handleFilterChange('volumen', e.target.value)}
                                >
                                    <option value="">Todos</option>
                                    {getUniqueVolumes().map(volumen => (
                                        <option key={volumen} value={volumen}>{volumen}ml</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-2 col-sm-6">
                                <label className="luxury-form-label">Precio Mín.</label>
                                <input
                                    type="number"
                                    className="luxury-form-control"
                                    placeholder="$ 0"
                                    value={filters.precioMin}
                                    onChange={(e) => handleFilterChange('precioMin', e.target.value)}
                                />
                            </div>

                            <div className="col-md-2 col-sm-6">
                                <label className="luxury-form-label">Precio Máx.</label>
                                <input
                                    type="number"
                                    className="luxury-form-control"
                                    placeholder="$ 999999"
                                    value={filters.precioMax}
                                    onChange={(e) => handleFilterChange('precioMax', e.target.value)}
                                />
                            </div>

                            <div className="col-md-2 col-sm-6 d-flex flex-column justify-content-end">
                                <div className="form-check">
                                    <input
                                        className="form-check-input luxury-checkbox"
                                        type="checkbox"
                                        checked={filters.soloConStock}
                                        onChange={(e) => handleFilterChange('soloConStock', e.target.checked)}
                                    />
                                    <label className="form-check-label luxury-form-label">
                                        Solo con stock
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div className="row mt-4">
                            <div className="col-12 d-flex flex-column flex-md-row justify-content-between align-items-center">
                                <button 
                                    className="luxury-clear-button mb-2 mb-md-0"
                                    onClick={clearFilters}
                                >
                                    Limpiar Filtros
                                </button>
                                <span className="luxury-result-text">
                                    Mostrando {filteredPerfumes.length} de {perfumes.length} perfumes
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resultados */}
                <div className="row g-3 g-md-4">
                    {filteredPerfumes.length === 0 ? (
                        <div className="col-12">
                            <div className="luxury-alert">
                                {perfumes.length === 0 
                                    ? "No hay perfumes disponibles en este momento."
                                    : "No hay perfumes que coincidan con los filtros seleccionados."
                                }
                            </div>
                        </div>
                    ) : (
                        filteredPerfumes.map((perfume) => (
                            <div key={perfume.id} className="col-lg-4 col-md-6 col-mobile-6">
                                <div className="luxury-product-card">
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
                                            <div className="luxury-product-price">
                                                ${perfume.precio.toLocaleString('es-AR')}
                                            </div>
                                            
                                            <div className="luxury-product-specs">
                                                <div className="luxury-spec-item">
                                                    <span className="luxury-product-label">Volumen</span>
                                                    <span className="luxury-product-value">{perfume.volumen}ml</span>
                                                </div>
                                                
                                                <div className="luxury-spec-item">
                                                    <span className="luxury-product-label">Género</span>
                                                    <span className="luxury-product-value">
                                                        {perfume.genero === 'M' ? 'Masculino' : 
                                                         perfume.genero === 'F' ? 'Femenino' : 
                                                         'Unisex'}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className={`luxury-stock-info ${
                                                perfume.stock > 0 ? 'luxury-stock-available' : 'luxury-stock-unavailable'
                                            }`}>
                                                <span className="luxury-product-label">Disponibilidad</span>
                                                <div className="luxury-product-value">
                                                    {perfume.stock > 0 ? `${perfume.stock} unidades` : 'Sin stock'}
                                                </div>
                                            </div>
                                            
                                            <a 
                                                href={`/perfume/${perfume.id}`} 
                                                className="luxury-details-button"
                                            >
                                                Ver detalles
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Body;