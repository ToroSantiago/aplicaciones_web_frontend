import React, { useState, useEffect } from "react";

const Body = () => {
    const [perfumes, setPerfumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Reemplaza esta URL con la URL de tu backend en Vercel
    const API_URL = 'https://aplicacioneswebbackend-git-dev-torosantiagos-projects.vercel.app/edp';

    useEffect(() => {
        fetchPerfumes();
    }, []);

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

    if (loading) {
        return (
            <div className="container mt-4">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger" role="alert">
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="row">
                {perfumes.length === 0 ? (
                    <div className="col-12">
                        <div className="alert alert-info" role="alert">
                            No hay perfumes disponibles en este momento.
                        </div>
                    </div>
                ) : (
                    perfumes.map((perfume) => (
                        <div key={perfume.id} className="col-md-4 mb-4">
                            <div className="card h-100">
                                <img 
                                    src={perfume.imagen_url || "https://via.placeholder.com/300x200?text=Sin+Imagen"} 
                                    className="card-img-top" 
                                    alt={perfume.nombre}
                                    style={{ height: '200px', objectFit: 'cover' }}
                                />
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title">{perfume.nombre}</h5>
                                    <h6 className="card-subtitle mb-2 text-muted">{perfume.marca}</h6>
                                    <p className="card-text flex-grow-1">{perfume.descripcion}</p>
                                    <div className="mt-auto">
                                        <p className="mb-2">
                                            <strong>Precio:</strong> ${perfume.precio.toLocaleString('es-AR')}
                                        </p>
                                        <p className="mb-2">
                                            <strong>Volumen:</strong> {perfume.volumen}ml
                                        </p>
                                        <p className="mb-2">
                                            <strong>Género:</strong> {
                                                perfume.genero === 'M' ? 'Masculino' : 
                                                perfume.genero === 'F' ? 'Femenino' : 
                                                'Unisex'
                                            }
                                        </p>
                                        <p className="mb-3">
                                            <strong>Stock:</strong> 
                                            <span className={perfume.stock > 0 ? 'text-success' : 'text-danger'}>
                                                {perfume.stock > 0 ? ` ${perfume.stock} unidades` : ' Sin stock'}
                                            </span>
                                        </p>
                                        <a href={`/perfume/${perfume.id}`} className="btn btn-primary w-100">
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
    );
};

export default Body;