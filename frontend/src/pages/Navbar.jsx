import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SignUp from "./Signup";
import { useAuthStore } from '../store/authStore';
import { ShoppingCart, Menu, X, User, Upload , Info, Package} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCartStore } from "../store/authStore";
import './Home.css'
import './HomeDark.css'

export default function Navbar() {
  const [showPopup, setShowPopup] = useState(false);
  const [lightMode, setLightMode] = useState(true);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const { user, logout, isAuthenticated } = useAuthStore();
  const [showSubTabs, setShowSubTabs] = useState(false);
  const { getCartCount } = useCartStore();
  const navigate = useNavigate();
  const cartCount = isAuthenticated ? getCartCount() : 0



  const toggleDarkMode = () => {
    const newMode = !lightMode;
    setLightMode(newMode);
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", newMode ? "light" : "dark");
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setLightMode(false);
      document.body.classList.add("dark");
    } else {
      setLightMode(true);
      document.body.classList.remove("dark");
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      setShowUserDropdown(false);
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error("Failed to logout");
    }
  };

  return (
    <>
      <nav className="my-navbar dark:bg-gray-800 text-gray-800 dark:text-white shadow-md w-full fixed z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img src="/images/logo.png" alt="logo" className="h-8 w-8" />
            <Link to="/" className="text-xl font-bold my-brand">ListKaro</Link>
          </div>

          {/* Desktop Search & Upload List */}
          <div className="hidden lg:flex items-center gap-4">
            <input
              type="search"
              placeholder="Search for items"
              className="px-3 py-1 rounded-md border dark:border-gray-600 dark:bg-gray-700 text-sm focus:outline-none"
            />
            <Link to="/uploadlist" className="flex gap-2 text-sm font-semibold upload-list-lg">
              <Upload size={20} className="text-gray-800 dark:text-white" />Upload List
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <Link
              to="/shopping-cart"
              className="px-3 py-1 rounded-md text-sm hover:bg-green-700 transition relative"
            >
              <ShoppingCart size={24} className="nav-cart-icon" />

              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">{cartCount}</span>
              )}
            </Link>

            {/* Theme toggle */}
            <img
              src={lightMode ? "/images/sun.png" : "/images/moon.png"}
              onClick={toggleDarkMode}
              alt="Toggle Theme"
              className="w-6 h-6 cursor-pointer"
            />

            {/* User Dropdown */}
            <div className="relative">
              <User
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                size={24}
                className="cursor-pointer nav-user-icon"
              />
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-40 nav-dropdown bg-gray-800 dark:bg-gray-700 border dark:border-gray-600 rounded shadow-lg text-sm z-50">
                  {isAuthenticated && user && (
                    <div className="block px-4 py-2 text-white font-semibold">
                      Hello, {user.name}
                    </div>
                  )}
                  <hr />
                  {!isAuthenticated && (
                    <>
                      <Link
                        to="/login"
                        className="block px-4 py-2 text-bold hover:bg-gray-100 dark:hover:bg-gray-600 nav-dropdown-link"
                        onClick={() => {
                          setShowPopup(true);
                          setShowUserDropdown(false);
                        }}
                      >
                        Login
                      </Link>
                      <Link
                        to="#"
                        className="block px-4 py-2 text-bold hover:bg-gray-100 dark:hover:bg-gray-600 nav-dropdown-link"
                        onClick={() => {
                          setShowPopup(true);
                          setShowUserDropdown(false);
                        }}
                      >
                        Signup
                      </Link>

                    </>
                  )}
                  {isAuthenticated && (<Link
                    to="/orders"
                    className="block px-4 py-2 text-bold hover:bg-gray-100 dark:hover:bg-gray-600 nav-dropdown-link"
                  >
                    Your Orders
                  </Link>
                  )}
                  <hr />
                  {isAuthenticated && (<Link
                    to="#"
                    className="block px-4 py-2 text-bold hover:bg-gray-100 dark:hover:bg-gray-600 nav-dropdown-link"
                    onClick={handleLogout}
                  >
                    Logout
                  </Link>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Toggle Button */}
            <div className="block">
              <button onClick={() => setShowSidebar(true)}>
                <Menu className="w-6 h-6 nav-toggle-icon dark:text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar (Offcanvas) */}
        {showSidebar && (
          <div className="fixed top-0 right-0 h-full w-64 nav-mob-screen-dropdown shadow-lg z-50 transform transition-transform duration-300 ease-in-out translate-x-0">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-600">
              <span className="text-lg font-semibold nav-sidebarheader-text  dark:text-white">Menu</span>
              <button onClick={() => setShowSidebar(false)}>
                <X className="w-5 h-5  nav-sidebar-close" />
              </button>
            </div>
            <div className="p-4">
              <input
                type="search"
                placeholder="Search for items"
                className="w-full px-3 py-2 mb-4 rounded-md border dark:border-gray-600 dark:bg-gray-700 text-sm focus:outline-none"
              />

              {/* For Upload list */}
              <Link
                to="/uploadlist"
                className="flex items-center gap-2 text-sm font-semibold upload-list px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Upload size={20} className="text-gray-800 dark:text-white" />
                Upload List
              </Link>

              <div>
                {/* Main Tab (All Products) */}
                <Link
                  to="#"
                  className="flex items-center gap-2 text-sm font-semibold upload-list px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setShowSubTabs((prev) => !prev)} // Toggle visibility of sub-tabs
                >
                  <Package size={20} className="text-gray-800 dark:text-white" /> 
                  All Products
                </Link>

                {/* Sub Tabs */}
                {showSubTabs && (
                  <div className="pl-6 mt-2 space-y-2">
                    <Link
                      to="/subtab1"
                      className="block text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
                    >
                      Sub Tab 1
                    </Link>
                    <Link
                      to="/subtab2"
                      className="block text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
                    >
                      Sub Tab 2
                    </Link>
                    <Link
                      to="/subtab3"
                      className="block text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
                    >
                      Sub Tab 3
                    </Link>
                    <Link
                      to="/subtab4"
                      className="block text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
                    >
                      Sub Tab 4
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/about"
                className="flex items-center gap-2 text-sm font-semibold upload-list px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Info size={20} className="text-gray-800 dark:text-white" />
                About
              </Link>

            </div>
          </div>
        )}
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      </nav>

      <SignUp showPopup={showPopup} setShowPopup={setShowPopup} />

    </>
  );
}
