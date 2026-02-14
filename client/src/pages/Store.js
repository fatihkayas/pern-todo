import React from "react";

const Store = ({ watches, addToCart }) => {
  return (
    <div className="container mt-4">
      <h3 className="text-center mb-4 fw-bold">⌚ Özel Saat Koleksiyonu</h3>
      <div className="row">
        {watches.map((watch) => (
          <div className="col-md-4 mb-4" key={watch.watch_id}>
            <div className="card h-100 shadow-sm border-0 rounded-4">
              <div className="bg-light p-4 text-center">
                <img 
                  src={watch.image_url} 
                  className="img-fluid" 
                  style={{ maxHeight: "180px", objectFit: "contain" }}
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"; }}
                  alt={watch.watch_name}
                />
              </div>
              <div className="card-body">
                <h5 className="card-title fw-bold">{watch.watch_name}</h5>
                <p className="card-text text-secondary small">{watch.description}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="h4 mb-0">${watch.price}</span>
                  <button className="btn btn-dark rounded-pill" onClick={() => addToCart(watch)}>Sepete Ekle</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Store;