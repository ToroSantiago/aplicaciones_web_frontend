import React from "react";

const Body = () => {
    return (
        <div class="container mt-4">
        <div class="row">
            <div class="col-md-4">
                <div class="card">
                    <img src="https://via.placeholder.com/150" class="card-img-top" alt="Imagen de ejemplo" />
                    <div class="card-body">
                        <h5 class="card-title">Título de la tarjeta</h5>
                        <p class="card-text">Descripción breve de la tarjeta.</p>
                        <a href="#" class="btn btn-primary">Más información</a>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <img src="https://via.placeholder.com/150" class="card-img-top" alt="Imagen de ejemplo" />
                    <div class="card-body">
                        <h5 class="card-title">Título de la tarjeta</h5>
                        <p class="card-text">Descripción breve de la tarjeta.</p>
                        <a href="#" class="btn btn-primary">Más información</a>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <img src="#" class="card-img-top" alt="Imagen de ejemplo" />
                    <div class="card-body">
                        <h5 class="card-title">Título de la tarjeta</h5>
                        <p class="card-text">Descripción breve de la tarjeta.</p>
                        <a href="#" class="btn btn-primary">Más información</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
};

export default Body;