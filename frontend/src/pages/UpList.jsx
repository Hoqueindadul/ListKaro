import './UpList.css';
import './UpListDark.css';
import { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './UpListSmall.css'
function UpList() {
  const [ocrText, setOcrText] = useState([]);
  const [productInputs, setProductInputs] = useState([
    { name: '', quantity: '' },
    { name: '', quantity: '' },
  ]);

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [ocrResult, setOcrResult] = useState(null);

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
    if (!selectedImage) {
      toast.error("Please select a file"); // Error toast for no file selected
      return;
    }

    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(selectedImage.type)) {
      toast.error("Please upload a valid JPG or PNG image"); // Error toast for invalid file type
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedImage);

    setLoading(true);
    setErrorMsg('');
    setOcrResult(null);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/upload-ocr',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true, // ⬅️ Enable sending cookies (JWT)
        }
      );

      if (response.data?.lines) {
        const extractedItems = extractItems(response.data.lines);
        setOcrText(extractedItems);
        toast.success("File uploaded and list extracted successfully!"); // Success toast
      } else {
        toast.error("Failed to extract list items!"); // Error toast if extraction fails
      }

      setOcrResult(response.data);
    } catch (error) {
      console.error('Upload failed:', error);
      if (error.response && error.response.status === 401) {
        setErrorMsg('Unauthorized. Please log in again.');
        toast.error('Unauthorized. Please log in again.'); // Error toast for unauthorized
      } else {
        setErrorMsg('Upload failed. Please try again.');
        toast.error('Upload failed. Please try again.'); // Error toast for general upload failure
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted products:', productInputs);

    // Add backend integration for manual input submission if needed
  };
  
  return (
    <>
      <div className="container list-upload-container rounded py-4 uphead">
        <h2 className="text-start mb-2" id='uploadtitle'>Upload Your List or Fill the Form</h2>
        <p className="text-start">
          Please upload list as the <strong>.jpg or .png</strong> format
        </p>
        <hr />
        <div className="row justify-content-start">
          <div className="col-12 col-md-10 col-lg-8">
            <div className="d-flex flex-column flex-md-row justify-content-between gap-4">

              {/* Upload Section */}
              <div className="flex-fill text-center p-3 border rounded shadow-lg">
                <div className="mb-3 upsection">
                  <div> 
                    <label htmlFor="fileId" className="d-block cursor-pointer">
                      <img src="/images/upload.png" alt="Upload" style={{ maxWidth: '100px', cursor: 'pointer' }} />
                    </label>
                  </div>
                  <div>
                    <input
                      type="file"
                      id="fileId"
                      className="form-control mt-2"
                      accept="image/png, image/jpeg"
                      onChange={handleFileChange}
                    />
                    <button onClick={upload} className="btn btn-primary mt-3 w-100">
                      {loading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
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
              <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
              {/* OR Divider */}
              <div className="d-flex align-items-center justify-content-center">
                <span className="fw-bold">OR</span>
              </div>

              {/* Manual Input Form */}
              <div className="flex-fill p-3 border rounded shadow-xl text-white upform min-w-full">
                <form onSubmit={handleSubmit}>
                  {productInputs.map((product, index) => (
                    <div
                      key={index}
                      className="d-flex flex-column flex-md-row align-items-center gap-2 mb-3"
                    >
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
                      <button type="button" onClick={() => removeProductField(index)} className="btn btn-outline-danger updelbtn"> Delete Section
                        <img src="/images/dustbin.png" alt="Remove" style={{ width: '25px', backgroundColor: "white" }} />
                      </button>
                    </div>
                  ))}

                  <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mt-3">
                    <input
                      type="button"
                      value="Add New Product +"
                      onClick={addNewProductField}
                      className="btn btn-outline-success w-100 w-md-auto"
                    />
                    <button type="submit" className="btn btn-primary w-100 w-md-auto">Upload</button>
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
