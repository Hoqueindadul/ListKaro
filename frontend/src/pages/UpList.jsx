import './UpList.css';
import './UpListDark.css';
import './UpListSmall.css';
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useBulkUploadStore } from '../store/authStore';
import { useAuthStore } from '../store/authStore';
import { LOCAL_URL } from '../deploy-backend-url';
import { DEPLOYMENT_URL } from '../deploy-backend-url';

function UpList() {
    const [ocrText, setOcrText] = useState([]);
    const [productInputs, setProductInputs] = useState([{ name: '', quantity: '' }]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false); // <-- NEW
    const [errorMsg, setErrorMsg] = useState('');
    const [ocrResult, setOcrResult] = useState(null);

    const navigate = useNavigate();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setOcrResult(null);
            setErrorMsg('');
        }
    };

    const upload = async () => {
         const token = localStorage.getItem("token");
        if (!isAuthenticated || !token) {
            toast.error("Please log in to upload product list.");
            navigate('/login');
            return;
        }

        if (!selectedImage) {
            toast.error("Please select a file");
            return;
        }

        const validTypes = ["image/jpeg", "image/png"];
        if (!validTypes.includes(selectedImage.type)) {
            toast.error("Please upload a valid JPG or PNG image");
            return;
        }

        const formData = new FormData();
        formData.append('image', selectedImage);

        setLoading(true);
        setErrorMsg('');
        setOcrResult(null);

        try {
            const response = await axios.post(
                `${LOCAL_URL}/api/upload-ocr`,
                formData,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                    withCredentials: true,
                }
            );

            if (response.data?.lines) {
                const extractedItems = extractItems(response.data.lines);
                setOcrText(extractedItems);
                toast.success(response.data.message || "File uploaded and list extracted successfully!");
            } else {
                toast.error(response.data.message || "Failed to extract list items!");
            }

            setOcrResult(response.data);
        } catch (error) {
            console.error('Upload failed:', error);
            if (error.response && error.response.status === 401) {
                setErrorMsg('Unauthorized. Please log in again.');
                toast.error('Unauthorized. Please log in again.');
            } else {
                setErrorMsg('Upload failed. Please try again.');
                toast.error('Upload failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const extractItems = (lines) => {
        const pattern = /^(.*)\s+(\d+(?:\.\d+)?\s*(?:kg|gm|g|ml|litre|l|pcs)?)$/i;

        return lines.map(line => {
            const match = line.match(pattern);
            if (match) {
                return {
                    name: match[1].trim().toLowerCase(),
                    quantity: match[2].trim(),
                };
            } else {
                const words = line.trim().split(" ");
                const name = words.slice(0, -1).join(" ");
                const quantity = words.slice(-1).join("");
                return {
                    name: name.toLowerCase(),
                    quantity,
                };
            }
        });
    };

    const handleChange = (index, field, value) => {
        const updated = [...productInputs];
        updated[index][field] = value;
        setProductInputs(updated);
    };

    const addNewProductField = () => {
        setProductInputs([...productInputs, { name: '', quantity: '' }]);
    };

    const removeProductField = (index) => {
        const updated = [...productInputs];
        updated.splice(index, 1);
        setProductInputs(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            toast.error("Please log in to upload.");
            navigate('/login');
            return;
        }

        setFormLoading(true); // <-- start loading

        try {
            const response = await useBulkUploadStore.getState().bulkUploadProducts(productInputs);

            if (response) {
                const { addedItems, notFoundItems } = response;

                if (addedItems.length > 0) {
                    toast.success(`Uploaded ${addedItems.length} product(s) successfully.`);
                }

                if (notFoundItems.length > 0) {
                    const unfoundNames = notFoundItems.map(item => `"${item.name}"`).join(", ");
                    toast.error(`Some products not found: ${unfoundNames}`);
                }

                setProductInputs([{ name: '', quantity: '' }]);
            } else {
                toast.error("Unexpected response from the server.");
            }

        } catch (error) {
            toast.error("Failed to bulk upload products.");
            console.error("Bulk upload error:", error);
        } finally {
            setFormLoading(false); // <-- stop loading
        }
    };

    return (
        <>
            <div className="container list-upload-container rounded uphead ">
                <h2 className="text-start mb-2" id="uploadtitle">Upload Your List or Fill the Form</h2>
                <p className="text-start">
                    Please upload list as the <strong>.jpg or .png</strong> format
                </p>
                <hr />
                <div className="row justify-content-center">
                    <div className="col-12 col-md-10 col-lg-8">
                        <div className="d-flex flex-column flex-lg-row gap-4">

                            {/* Upload Section */}
                            <div className="flex-fill text-center p-3 border rounded shadow-sm bg-gray-800">
                                <div className="mb-3 upsection">
                                    <label htmlFor="fileId" className="d-block cursor-pointer">
                                        <img src="/images/upload.png" alt="Upload" style={{ maxWidth: '100px', cursor: 'pointer' }} />
                                    </label>
                                    <input
                                        type="file"
                                        id="fileId"
                                        className="form-control mt-2"
                                        accept="image/png, image/jpeg"
                                        onChange={handleFileChange}
                                    />
                                    <button onClick={upload} className="btn btn-primary mt-3 w-100" disabled={loading}>
                                        {loading ? 'Uploading...' : 'Upload'}
                                    </button>
                                </div>

                                {selectedImage && (
                                    <div className="mt-3">
                                        <p><strong>Selected File:</strong> {selectedImage.name}</p>
                                        {previewUrl && (
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="img-fluid rounded"
                                                style={{ maxHeight: '200px' }}
                                            />
                                        )}
                                    </div>
                                )}

                                {errorMsg && (
                                    <div className="alert alert-danger mt-3">{errorMsg}</div>
                                )}
                            </div>

                            {/* OR Divider (visible only on medium+) */}
                            <div className="d-none d-lg-flex align-items-center justify-content-center">
                                <span className="fw-bold">OR</span>
                            </div>

                            {/* Manual Form Section */}
                            <div className="flex-fill p-3 border rounded shadow-sm bg-dark text-white">
                                <form onSubmit={handleSubmit}>
                                    {productInputs.map((product, index) => (
                                        <div key={index} className="d-flex flex-column flex-md-row align-items-center gap-2 mb-3">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Product Name (e.g Egg, Milk)"
                                                value={product.name}
                                                onChange={(e) => handleChange(index, 'name', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Quantity (e.g 20kg, 200ml, 7p)"
                                                value={product.quantity}
                                                onChange={(e) => handleChange(index, 'quantity', e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeProductField(index)}
                                                className="btn btn-outline-light"
                                            >
                                                <img src="/images/dustbin.png" alt="Remove" style={{ width: '50px', backgroundColor: 'white' }} />
                                            </button>
                                        </div>
                                    ))}

                                    <div className="d-grid gap-2 d-md-flex justify-content-between mt-3">
                                        <button type="button" onClick={addNewProductField} className="btn btn-outline-success w-100 w-md-auto">
                                            Add New Product +
                                        </button>
                                        <button type="submit" className="btn btn-primary w-100 w-md-auto" disabled={formLoading}>
                                            {formLoading ? "Adding to cart..." : "Upload"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default UpList;
