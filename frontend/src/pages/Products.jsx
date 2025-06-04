import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './HomeDark.css';
import { Star, StarHalf } from 'lucide-react';
import { DEPLOYMENT_URL } from "../deploy-backend-url";

const API_URL = import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/products"
    : `${DEPLOYMENT_URL}/api/products`;

const ProductList = () => {
    const [products, setProducts] = useState({});

    useEffect(() => {
        axios.get(`${API_URL}/getAllProducts`, { withCredentials: true })
            .then(res => {
                const allProducts = res.data.data || [];
                const grouped = {};

                allProducts.forEach(product => {
                    const category = product.category || 'Others';
                    if (!grouped[category]) {
                        grouped[category] = [];
                    }
                    grouped[category].push(product);
                });

                setProducts(grouped);
            })
            .catch(err => {
                console.error("Error fetching products:", err);
            });
    }, []);

    const renderStars = (rating = 0) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <Star key={`full-${i}`} fill="yellow" strokeWidth={0} size={20} className="me-1" />
            );
        }

        if (hasHalfStar) {
            stars.push(
                <StarHalf key="half" fill="yellow" strokeWidth={0} size={20} className="me-1" />
            );
        }

        while (stars.length < 5) {
            stars.push(
                <Star key={`empty-${stars.length}`} fill="gray" strokeWidth={0} size={20} className="me-1" />
            );
        }

        return stars;
    };

    return (
        <div className="container my-4">
            {Object.keys(products).length === 0 && (
                <p className="text-center">Loading products...</p>
            )}

            {Object.entries(products).map(([category, items]) => (
                <div key={category} className="mb-5">
                    <h3 className="mb-3 text-black product-category-title fw-bold text-capitalize">
                        {category}
                    </h3>
                    <div className="row">
                        {items.map(product => (
                            <div key={product._id} className="col-md-4 mb-4">
                                <div className="card h-100 shadow-sm bg-white text-black card-container">
                                    {product.image?.[0]?.url && (
                                        <img
                                            src={product.image[0].url}
                                            className="card-img-top"
                                            alt={product.name}
                                            style={{ height: '200px', objectFit: 'cover' }}
                                        />
                                    )}
                                    <div className="card-body d-flex flex-column">
                                        <h5 className="card-title fs-4 text-capitalize">{product.name}</h5>
                                        <p
                                            className="card-text text-truncate"
                                            title={product.description}
                                            style={{ minHeight: '3rem' }}
                                        >
                                            {product.description || 'No description available.'}
                                        </p>
                                        <div className="d-flex align-items-center mb-3">
                                            {renderStars(product.ratings || 0)}
                                            <span className="badge bg-light text-primary fw-bold ms-2">
                                                {(product.ratings ?? 0).toFixed(1)}
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mt-auto">
                                            <h2 className="mb-0 card-title product-price fw-bold fs-3">
                                                ₹ {product.price?.toFixed(2) ?? 'N/A'}
                                            </h2>
                                            <button className="btn btn-primary fw-bold">Buy Now</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductList;
