import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import './Dashboard.css';

export default function Dashboard() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: "",
        description: "",
        price: "",
        quantityValue: "",
        quantityUnit: "",
        category: "",
        stock: "",
        images: [],
      });    
    const [selectedImages, setSelectedImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 5;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await axios.get("http://localhost:5000/api/products/getAllProducts");
                setProducts(response.data.data);
            } catch (error) {
                setError("Failed to load products.");
                console.error("Fetch Products Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleDelete = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;

        try {
            await axios.delete(`http://localhost:5000/api/products/deleteProduct/${productId}`);
            const updatedProducts = products.filter((product) => product._id !== productId);
            setProducts(updatedProducts);

            if (updatedProducts.length <= (currentPage - 1) * productsPerPage) {
                setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
            }
        } catch (error) {
            console.error("Delete Error:", error);
            setError("Failed to delete product.");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        setSelectedImages(e.target.files);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setUploading(true);
    
        const formData = new FormData();
        formData.append("name", newProduct.name);
        formData.append("description", newProduct.description);
        formData.append("price", newProduct.price);
        formData.append("category", newProduct.category);
        formData.append("stock", newProduct.stock);
        formData.append("quantityValue", newProduct.quantityValue);
        formData.append("quantityUnit", newProduct.quantityUnit);
    
        Array.from(selectedImages).forEach((file) => {
            formData.append("image", file);
        });
    
        try {
            let response;
    
            if (isEditing) {
                response = await axios.put(
                    `http://localhost:5000/api/products/updateProduct/${editingProductId}`,
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
                setProducts(products.map((p) =>
                    p._id === editingProductId ? response.data.data : p
                ));
            } else {
                response = await axios.post(
                    "http://localhost:5000/api/products/createProduct",
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
                setProducts([...products, response.data.product]);
            }
    
            setShowModal(false);
            setIsEditing(false);
            setEditingProductId(null);
            setNewProduct({
                name: "",
                category: "",
                price: "",
                description: "",
                stock: "",
                quantityValue: "",
                quantityUnit: "",
                images: [],
            });
            setSelectedImages([]);
        } catch (error) {
            console.error("Upload/Update Error:", error);
            setError("Failed to process product.");
        } finally {
            setUploading(false);
        }
    };
    

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    
    const [isEditing, setIsEditing] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const handleEdit = (product) => {
        setShowModal(true);
        setIsEditing(true);
        setEditingProductId(product._id);
        setNewProduct({
            name: product.name,
            category: product.category,
            price: product.price,
            description: product.description,
            stock: product.stock,
            quantityValue: product.quantity?.value || "",
            quantityUnit: product.quantity?.unit || "",
            images: product.image || [], 
        });
    };
    
    return (
        <>
            <div className="adminContainer">

                <nav className="navbar adminnav">
                    <div className="container">
                        <button className="btn btn-outline-light" type="button"
                            data-bs-toggle="offcanvas"
                            data-bs-target="#offcanvasAdmin"
                            aria-controls="offcanvasAdmin"
                        > ☰ </button>

                        <h3 className="navbar-brand">ListKaro</h3>
                        <p>Admin Panel</p>
                    </div>
                </nav>

                <div className="offcanvas adminoffcanvas offcanvas-start" tabIndex="-1" id="offcanvasAdmin" aria-labelledby="offcanvasAdminLabel">
                    <div className="offcanvas-header">
                        <h5 id="offcanvasAdminLabel">ListKaro Admin Panel</h5>
                        <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </div>
                    <div className="offcanvas-body">
                        <ul className="navabr-nav">
                            <li className="nav-item">
                                <a href="/adminpanel" className="nav-link">Dashboard</a>
                            </li>
                            <li className="nav-item">
                                <a href="/allproducts" className="nav-link">All Products</a>
                            </li>
                            <li className="nav-item">
                                <a href="/" className="nav-link">Go to Home Page</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="container mt-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2>All Products</h2>
                        <Button variant="primary" onClick={() => setShowModal(true)}>
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
                                    {currentProducts.map((product) => (
                                        <tr key={product._id}>
                                            <td>{product.name}</td>
                                            <td>{product.category}</td>
                                            <td>₹{product.price}</td>
                                            <td>
                                                {Array.isArray(product.image) &&
                                                    product.image.map((img, index) => (
                                                        <img
                                                            key={index}
                                                            src={img.url}
                                                            alt={product.name}
                                                            style={{ width: "50px", height: "50px", marginRight: "5px" }}
                                                        />
                                                    ))}
                                            </td>
                                            <td>
                                                {product.quantity ? `${product.quantity.value} ${product.quantity.unit}` : "N/A"}
                                            </td>
                                            <td>
                                            <button style={{border:'none', backgroundColor:'blue', width:'50px', borderRadius:'30px', color:'white', padding:'2px'}} onClick={() => handleEdit(product)}>
                                                Edit
                                            </button>
                                            </td>
                                            <td>
                                                <button style={{border:'none', backgroundColor:'red', width:'60px', borderRadius:'30px', color:'white', padding:'2px'}} onClick={() => handleDelete(product._id)}>
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

                    <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Upload Product</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={handleUpload}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Product Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={newProduct.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Category</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="category"
                                        value={newProduct.category}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Price</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="price"
                                        value={newProduct.price}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="description"
                                        value={newProduct.description}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Stock</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="stock"
                                        value={newProduct.stock}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                <Form.Label>Quantity Value</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="quantityValue"
                                    value={newProduct.quantityValue}
                                    onChange={handleInputChange}
                                    required
                                />
                                </Form.Group>

                                <Form.Group className="mb-3">
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

                         
                                <Form.Group className="mb-3">
                                    <Form.Label>Images</Form.Label>
                                    <Form.Control type="file" multiple onChange={handleImageChange} />
                                </Form.Group>
                                <div className="d-flex justify-content-center">
                                    <Button variant="primary" type="submit" disabled={uploading}>
                                        {uploading ? "Uploading..." : "Upload"}
                                    </Button>
                                </div>
                            </Form>
                        </Modal.Body>
                    </Modal>
                </div>

            </div>
        </>
    );
}
