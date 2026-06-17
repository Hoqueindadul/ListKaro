import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Star, StarHalf, ShoppingBag, SlidersHorizontal } from "lucide-react";
import { DEPLOYMENT_URL } from "../../deploy-backend-url";

const ProductListing = () => {
  const [products, setProducts] = useState({});
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${DEPLOYMENT_URL}/api/products/getAllProducts`, {
        withCredentials: true,
      })
      .then((res) => {
        const allProducts = res.data.data || [];
        const grouped = {};
        const cats = new Set(["All"]);

        allProducts.forEach((product) => {
          const category = product.category || "Others";
          cats.add(category);

          if (!grouped[category]) {
            grouped[category] = [];
          }
          grouped[category].push(product);
        });

        setProducts(grouped);
        setCategories(Array.from(cats));
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
      });
  }, []);

  const handleBuyNow = (product) => {
    navigate("/checkout", { state: { product } });
  };

  const renderStars = (rating = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const starColor = "#ffb300";
    const emptyColor = "rgba(156, 163, 175, 0.2)";

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          fill={starColor}
          stroke={starColor}
          strokeWidth={1}
          size={14}
          className="mr-1"
        />,
      );
    }
    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half"
          fill={starColor}
          stroke={starColor}
          strokeWidth={1}
          size={14}
          className="mr-1"
        />,
      );
    }
    while (stars.length < 5) {
      stars.push(
        <Star
          key={`empty-${stars.length}`}
          fill={emptyColor}
          stroke="transparent"
          size={14}
          className="mr-1 dark:fill-gray-700"
        />,
      );
    }
    return stars;
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8 dark:bg-[#070d19] text-gray-900 dark:text-white transition-colors duration-200">
      {/* --- FILTER CONTROL HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <SlidersHorizontal
            size={18}
            className="text-cyan-500 dark:text-cyan-400"
          />
          <span className="font-bold tracking-wider uppercase text-xs text-gray-700 dark:text-gray-300">
            Filter By Category
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all duration-200 ${
                selectedCategory === cat
                  ? "bg-cyan-500 text-white dark:bg-cyan-400 dark:text-black shadow-md scale-105"
                  : "bg-transparent text-gray-600 border border-gray-200 hover:bg-gray-100 dark:bg-transparent dark:text-gray-400 dark:border-gray-800 dark:hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Block View Surface */}
      {Object.keys(products).length === 0 && (
        <div className="flex justify-center items-center py-20 gap-3">
          <div className="w-6 h-6 border-2 border-cyan-500 dark:border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium animate-pulse">
            Loading premium catalogue...
          </span>
        </div>
      )}

      {Object.entries(products).map(([category, items]) => {
        if (selectedCategory !== "All" && selectedCategory !== category)
          return null;

        return (
          <div key={category} className="mb-12">
            {/* --- CATEGORY HEADER --- */}
            <div className="flex items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize pr-4 tracking-tight">
                {category}
              </h3>
              <div className="flex-1 h-[1px] bg-gray-200 dark:bg-gradient-to-r dark:from-gray-800 dark:to-transparent"></div>
            </div>

            {/* Responsive Pure Tailwind Grid Layout Replacing Bootstrap System */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((product) => (
                <div
                  key={product._id}
                  className=" dark:bg-[#0b1426] border border-gray-200/60 dark:border-gray-800/60 rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-md dark:hover:border-cyan-500/30 transition-all duration-300 group"
                >
                  {/* Image Presentation Field */}
                  {product.image?.[0]?.url && (
                    <div className="h-52 relative p-4 flex items-center justify-center overflow-hidden shrink-0">
                      <Link
                        to={`/product/${product._id}`}
                        className="w-full h-full flex items-center justify-center"
                      >
                        <img
                          src={product.image[0].url}
                          className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-300"
                          alt={product.name}
                        />
                      </Link>
                      <span className="absolute top-3 left-3 bg-gray-900 text-cyan-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                        {product.category || "Fresh"}
                      </span>
                    </div>
                  )}

                  {/* Context/Description Card Body */}
                  <div className="p-4 flex flex-col flex-1">
                    <Link
                      to={`/product/${product._id}`}
                      className="no-underline hover:underline text-gray-900 dark:text-white"
                    >
                      <h5
                        className="font-bold capitalize truncate text-sm mb-1"
                        title={product.name}
                      >
                        {product.name}
                      </h5>
                    </Link>

                    <p
                      className="text-xs text-gray-500 dark:text-gray-400 truncate mb-3"
                      title={product.description}
                    >
                      {product.description || "No description available."}
                    </p>

                    {/* Rating Layout Unit */}
                    <div className="flex items-center mb-4">
                      <div className="flex items-center bg-gray-200/60 dark:bg-gray-900/50 px-2 py-1 rounded-lg border border-gray-300/40 dark:border-gray-800 text-gray-800 dark:text-white">
                        {renderStars(product.ratings || 0)}
                        <span className="text-[11px] font-bold ml-1.5 mt-0.5">
                          {(product.ratings ?? 0).toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Split action frame */}
                    <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-200 dark:border-gray-800/80">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                          PRICE
                        </span>
                        <h4 className="text-base font-extrabold text-gray-900 dark:text-white">
                          ₹{product.price ? product.price.toFixed(2) : "0.00"}
                        </h4>
                      </div>

                      <button
                        onClick={() => handleBuyNow(product)}
                        className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-600 text-white dark:bg-cyan-400 dark:hover:bg-cyan-500 dark:text-black px-3.5 py-2 rounded-full text-xs font-bold transition-all duration-200 shadow-sm"
                      >
                        <ShoppingBag size={13} />
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductListing;
