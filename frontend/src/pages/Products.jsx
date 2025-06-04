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
        axios.get(`${API_URL}/getAllProducts`)
            .then(res => {
                const allProducts = res.data.data;
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

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={`full-${i}`} fill="yellow" strokeWidth={0} size={20} className="me-1" />);
        }

        if (hasHalfStar) {
            stars.push(<StarHalf key="half" fill="yellow" strokeWidth={0} size={20} className="me-1" />);
        }

        while (stars.length < 5) {
            stars.push(<Star key={`empty-${stars.length}`} fill="gray" strokeWidth={0} size={20} className="me-1" />);
        }

        return stars;
    };

    return (
        <div className="container my-4">
            {Object.keys(products).map(category => (
                <div key={category} className="mb-5">
                    <h3 className="mb-3 text-black product-category-title fw-bold">{category}</h3>
                    <div className="row">
                        {products[category].map(product => (
                            <div key={product._id} className="col-md-4 mb-4 ">
                                <div className="card h-100 shadow-sm  bg-white  text-black card-container">
                                    {product.image?.[0]?.url && (
                                        <img
                                            src={product.image[0].url}
                                            className="card-img-top"
                                            alt={product.name}
                                            style={{ height: '200px', objectFit: 'cover' }}
                                        />
                                    )}
                                    <div className="card-body d-flex flex-column">
                                        <h5 className="card-title fs-4">{product.name}</h5>

                                        <p className="card-text text-truncate" title={product.description}>
                                            {product.description}
                                        </p>

                                        <div className="d-flex align-items-center mb-3">
                                            {renderStars(product.ratings)}
                                            <span className="badge bg-light text-primary fw-bold ms-2">
                                                {product.ratings?.toFixed(1) || "0.0"}
                                            </span>
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center mt-auto">
                                            <h2 className="mb-0 card-title product-price fw-bold fs-3">₹ {product.price}</h2>
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
