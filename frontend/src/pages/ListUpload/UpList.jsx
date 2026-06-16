import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useBulkUploadStore } from "../../store/authStore";
import { useAuthStore } from "../../store/authStore";
import { LOCAL_URL } from "../../deploy-backend-url";
import { DEPLOYMENT_URL } from "../../deploy-backend-url";
import {
  UploadCloud,
  Trash2,
  Plus,
  ShoppingCart,
  FileText,
} from "lucide-react";

function UpList() {
  const [ocrText, setOcrText] = useState([]);
  const [productInputs, setProductInputs] = useState([
    { name: "", quantity: "" },
  ]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [ocrResult, setOcrResult] = useState(null);

  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setOcrResult(null);
      setErrorMsg("");
    }
  };

  const upload = async () => {
    const token = localStorage.getItem("token");
    if (!isAuthenticated || !token) {
      toast.error("Please log in to upload product list.");
      navigate("/login");
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
    formData.append("image", selectedImage);

    setLoading(true);
    setErrorMsg("");
    setOcrResult(null);

    try {
      const response = await axios.post(
        `${LOCAL_URL}/api/upload-ocr`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        },
      );

      if (response.data?.lines) {
        const extractedItems = extractItems(response.data.lines);
        setProductInputs(extractedItems); // Populate inputs directly for easier editing
        toast.success(
          response.data.message ||
            "File uploaded and list extracted successfully!",
        );
      } else {
        toast.error(response.data.message || "Failed to extract list items!");
      }

      setOcrResult(response.data);
    } catch (error) {
      console.error("Upload failed:", error);
      if (error.response && error.response.status === 401) {
        setErrorMsg("Unauthorized. Please log in again.");
        toast.error("Unauthorized. Please log in again.");
      } else {
        setErrorMsg("Upload failed. Please try again.");
        toast.error("Upload failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const extractItems = (lines) => {
    const pattern = /^(.*)\s+(\d+(?:\.\d+)?\s*(?:kg|gm|g|ml|litre|l|pcs)?)$/i;

    return lines.map((line) => {
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
    setProductInputs([...productInputs, { name: "", quantity: "" }]);
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
      navigate("/login");
      return;
    }

    setFormLoading(true);

    try {
      const response = await useBulkUploadStore
        .getState()
        .bulkUploadProducts(productInputs);

      if (response) {
        const { addedItems, notFoundItems } = response;

        if (addedItems.length > 0) {
          toast.success(
            `Uploaded ${addedItems.length} product(s) successfully.`,
          );
        }

        if (notFoundItems.length > 0) {
          const unfoundNames = notFoundItems
            .map((item) => `"${item.name}"`)
            .join(", ");
          toast.error(`Some products not found: ${unfoundNames}`);
        }

        setProductInputs([{ name: "", quantity: "" }]);
      } else {
        toast.error("Unexpected response from the server.");
      }
    } catch (error) {
      toast.error("Failed to bulk upload products.");
      console.error("Bulk upload error:", error);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12 transition-colors duration-300">
      {/* Header Section */}
      <div className="mb-10 text-start">
        <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2">
          Upload Your List{" "}
          <span className="text-[#00b074]">or Fill the Form</span>
        </h2>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Quickly purchase your items using an image snapshot ( .jpg, .png) or
          map fields manually below.
        </p>
        <div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mt-4 rounded-full" />
      </div>

      {/* Split Content layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Upload Panel Card */}
        <div className="lg:col-span-5 rounded-2xl border border-gray-200/60 dark:border-white/10 p-6 shadow-sm shadow-gray-100 dark:shadow-none flex flex-col justify-between min-h-[460px]">
          <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-[#00b074]" /> Smart Image
              Extraction
            </h3>

            <label
              htmlFor="fileId"
              className="group relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300/80 dark:border-white/10 rounded-xl p-8 text-center cursor-pointer transition-all"
            >
              <UploadCloud
                size={44}
                className="text-gray-400 dark:text-gray-500 group-hover:text-emerald-500 transition-colors mb-3"
              />
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white mb-1">
                Click to select image
              </span>
              <span className="text-[10px] text-black dark:text-gray-500">
                PNG, JPG format up to 5MB
              </span>
              <input
                type="file"
                id="fileId"
                className="hidden"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
              />
            </label>

            {selectedImage && (
              <div className="mt-5 p-3 rounded-xl bg-gray-100/60  border border-gray-200/50 dark:border-white/5 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
                  <span className="font-bold truncate max-w-[200px]">
                    {selectedImage.name}
                  </span>
                  <span>Selected</span>
                </div>
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-44 object-cover rounded-lg border border-gray-200/30 dark:border-white/10"
                  />
                )}
              </div>
            )}

            {errorMsg && (
              <div className="mt-4 p-3 rounded-xl text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
                {errorMsg}
              </div>
            )}
          </div>

          <button
            onClick={upload}
            className="mt-6 w-full h-11 bg-[#00b074] text-white rounded-xl text-sm font-bold shadow-[0_4px_12px_rgba(0,176,116,0.15)] dark:shadow-[0_0_15px_rgba(0,176,116,0.2)] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing File...
              </>
            ) : (
              "Extract List Items"
            )}
          </button>
        </div>

        {/* Mid Divider */}
        <div className="lg:col-span-1 h-full flex lg:flex-col items-center justify-center text-center py-2 lg:py-0">
          <div className="w-full h-[1px] lg:w-[1px] lg:h-32  " />
          <span className="px-3 py-1  text-xs font-black text-gray-400 dark:text-gray-500 rounded-full my-2">
            OR
          </span>
          <div className="w-full h-[1px] lg:w-[1px] lg:h-32  " />
        </div>

        {/* Manual Item Form Panel Card */}
        <div className="lg:col-span-6 rounded-2xl border border-gray-200/60 dark:border-white/10 p-6 shadow-sm shadow-gray-100 dark:shadow-none min-h-[460px] flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <ShoppingCart size={18} className="text-blue-500" /> Verify &
              Purchase Items
            </h3>

            <form
              onSubmit={handleSubmit}
              className="space-y-3 max-h-[340px] overflow-y-auto pr-1"
            >
              {productInputs.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 group animate-fadeIn"
                >
                  <input
                    type="text"
                    className="
    flex-[2]
    h-11
    bg-transparent
    border border-gray-200/80
    dark:border-white/10
    rounded-xl
    px-4
    text-sm
    font-semibold
    text-gray-800
    dark:text-white
    placeholder:text-gray-400
    focus:outline-none
    focus:border-emerald-500
    transition-colors
  "
                    placeholder="Product Name (e.g. Eggs, Milk)"
                    value={product.name}
                    onChange={(e) =>
                      handleChange(index, "name", e.target.value)
                    }
                    required
                  />
                  <input
                    type="text"
                    className="
    flex-1
    h-11
    bg-transparent
    border border-gray-200/80
    dark:border-white/10
    rounded-xl
    px-4
    text-sm
    font-semibold
    text-gray-800
    dark:text-white
    placeholder:text-gray-400
    focus:outline-none
    focus:border-emerald-500
    transition-colors
  "
                    placeholder="Qty (e.g. 2kg, 1l)"
                    value={product.quantity}
                    onChange={(e) =>
                      handleChange(index, "quantity", e.target.value)
                    }
                    required
                  />{" "}
                  <button
                    type="button"
                    onClick={() => removeProductField(index)}
                    disabled={productInputs.length === 1}
                    className="w-11 h-11 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10  dark:bg-[#070d19] hover:bg-red-500/10 text-gray-400 hover:text-red-500 disabled:opacity-40 transition-colors shrink-0 shadow-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={addNewProductField}
                  className="h-11 px-4 border border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto shadow-[0_4px_12px_rgba(16,185,129,0.05)]"
                >
                  <Plus size={14} /> Add New Row
                </button>

                <button
                  type="submit"
                  className="h-11 px-6 bg-blue-600/90 hover:bg-blue-600 text-white rounded-xl text-sm font-bold shadow-[0_4px_12px_rgba(59,130,246,0.15)] dark:shadow-[0_0_15px_rgba(59,130,246,0.2)] disabled:opacity-50 transition-all flex items-center justify-center gap-2 ml-auto w-full sm:w-auto"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Adding to cart...
                    </>
                  ) : (
                    "Add Items to Cart"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpList;
