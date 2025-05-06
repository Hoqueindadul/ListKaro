import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useProductStore } from "../store/authStore";
import { toast } from 'react-toastify';

import "./Dashboard.css";

export default function Dashboard() {
    const {
        products,
        loading,
        error,
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,
    } = useProductStore();

    const [showModal, setShowModal] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
        quantityValue: "",
        quantityUnit: "",
        images: [],
    });
    const [selectedImages, setSelectedImages] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 5;

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleDelete = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        await deleteProduct(productId)
        toast.success("Product deleted successfully!")
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedImages(files);
    };

    const resetForm = () => {
        setNewProduct({
            name: "",
            description: "",
            price: "",
            category: "",
            stock: "",
            quantityValue: "",
            quantityUnit: "",
            images: [],
        });
        setSelectedImages([]);
        setEditingProductId(null);
        setIsEditing(false);
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("name", newProduct.name);
        formData.append("description", newProduct.description);
        formData.append("price", newProduct.price);
        formData.append("category", newProduct.category);
        formData.append("stock", newProduct.stock);
        formData.append("quantity.value", newProduct.quantityValue);
        formData.append("quantity.unit", newProduct.quantityUnit);


        Array.from(selectedImages).forEach((file) => {
            formData.append("images", file);
        });

        try {
            if (isEditing) {
               const response = await updateProduct(editingProductId, formData);
                toast.success(response.message || "Product updated successfully!");
            } else {
                const response = await createProduct(formData);
                toast.success(response.message || "Product created successfully!")
            }

            await fetchProducts();
            setShowModal(false);
            resetForm();
        } catch (err) {
            console.error("Upload/Update Error:", err);
            const errorMessage =
            err.message || "Something went wrong. Please try again.";

            toast.error(errorMessage);
        }
    };

    const handleEdit = (product) => {
        setShowModal(true);
        setIsEditing(true);
        setEditingProductId(product?._id);
        setNewProduct({
            name: product?.name || "",
            description: product?.description || "",
            price: product?.price || "",
            category: product?.category || "",
            stock: product?.stock || "",
            quantityValue: product?.quantity?.value || "",
            quantityUnit: product?.quantity?.unit || "",
            images: product?.image || [],
        });
        setSelectedImages([]); // Will reselect new files if needed
    };

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = Array.isArray(products)
        ? products.slice(indexOfFirstProduct, indexOfLastProduct)
        : [];

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="adminContainer">
            <nav className="navbar adminnav">
                <div className="container">
                    <button
                        className="btn btn-outline-light"
                        type="button"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#offcanvasAdmin"
                        aria-controls="offcanvasAdmin"
                    >
                        ☰
                    </button>
                    <h3 className="navbar-brand">ListKaro</h3>
                    <p>Admin Panel</p>
                </div>
            </nav>

            <div
                className="offcanvas adminoffcanvas offcanvas-start"
                tabIndex="-1"
                id="offcanvasAdmin"
                aria-labelledby="offcanvasAdminLabel"
            >
                <div className="offcanvas-header">
                    <h5 id="offcanvasAdminLabel">ListKaro Admin Panel</h5>
                    <button
                        type="button"
                        className="btn-close text-reset"
                        data-bs-dismiss="offcanvas"
                        aria-label="Close"
                    ></button>
                </div>
                <div className="offcanvas-body">
                    <ul className="navbar-nav">
                        <li className="nav-item"><a href="/adminpanel" className="nav-link">Dashboard</a></li>
                        <li className="nav-item"><a href="/allproducts" className="nav-link">All Products</a></li>
                        <li className="nav-item"><a href="/" className="nav-link">Go to Home Page</a></li>
                    </ul>
                </div>
            </div>

            <div className="container mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>All Products</h2>
                    <Button onClick={() => { setShowModal(true); resetForm(); }}>
                        + Upload Product
                    </Button>
                </div>

                {error && <p className="text-danger">{error}</p>}

                {loading ? (
                    <div className="d-flex justify-content-center align-items-center">
                        <Spinner animation="border" variant="primary" />
                        <span className="ms-2">Loading products...</span>
                    </div>
                ) : currentProducts.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Images</th>
                                    <th>Quantity</th>
                                    <th>Update</th>
                                    <th>Remove</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentProducts.map((product, index) => (
                                    <tr key={product._id || index}>
                                        <td>{product?.name}</td>
                                        <td>{product?.category}</td>
                                        <td>₹{product?.price}</td>
                                        <td>
                                            {Array.isArray(product.image) && product.image.map((img, i) => (
                                                <img
                                                    key={i}
                                                    src={img?.url}
                                                    alt={product.name}
                                                    style={{ width: "50px", height: "50px", marginRight: "5px" }}
                                                />
                                            ))}
                                        </td>
                                        <td>{product?.quantity ? `${product.quantity.value} ${product.quantity.unit}` : "N/A"}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => handleEdit(product)}
                                            >
                                                Edit
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDelete(product._id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <nav>
                            <ul className="pagination justify-content-center">
                                {[...Array(Math.ceil(products.length / productsPerPage)).keys()].map((number) => (
                                    <li key={number} className="page-item">
                                        <button onClick={() => paginate(number + 1)} className="page-link">
                                            {number + 1}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                ) : (
                    <p>No products available.</p>
                )}
            </div>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? "Update Product" : "Add Product"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleUpload} encType="multipart/form-data">
                        <Form.Group>
                            <Form.Label>Name</Form.Label>
                            <Form.Control name="name" value={newProduct.name} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Description</Form.Label>
                            <Form.Control name="description" value={newProduct.description} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Price</Form.Label>
                            <Form.Control name="price" value={newProduct.price} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Category</Form.Label>
                            <Form.Control name="category" value={newProduct.category} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Stock</Form.Label>
                            <Form.Control name="stock" value={newProduct.stock} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Quantity Value</Form.Label>
                            <Form.Control name="quantityValue" value={newProduct.quantityValue} onChange={handleInputChange} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Quantity Unit</Form.Label>
                            <Form.Select
                                name="quantityUnit"
                                value={newProduct.quantityUnit}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Unit</option>
                                <option value="kg">kg</option>
                                <option value="g">g</option>
                                <option value="litre">litre</option>
                                <option value="ml">ml</option>
                                <option value="pcs">pcs</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Images</Form.Label>
                            <Form.Control type="file" multiple onChange={handleImageChange} />
                        </Form.Group>
                        {isEditing && newProduct.images?.length > 0 && (
                            <div className="mt-2">
                                <p>Existing Images:</p>
                                {newProduct.images.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img?.url}
                                        alt={`product-${idx}`}
                                        style={{ width: 50, height: 50, marginRight: 5 }}
                                    />
                                ))}
                            </div>
                        )}
                        <Button variant="primary" type="submit" className="mt-3">
                            {isEditing ? "Update Product" : "Add Product"}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
}
