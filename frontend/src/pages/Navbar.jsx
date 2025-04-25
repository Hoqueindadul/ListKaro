import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SignUp from "./Signup";
import {useNavigate} from 'react-router-dom';

export default function Navbar() {
  const [showPopup, setShowPopup] = useState(false);
  const [lightMode, setLightMode] = useState(true);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-md w-full fixed z-50 transition-all duration-300">
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
            <Link to="/uploadlist" className="text-sm font-semibold hover:underline">
              Upload List
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <Link
              to="/shopping-cart"
              className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 transition"
            >
              🛒
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
              <img
                src="/images/user.png"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                alt="User"
                className="w-6 h-6 cursor-pointer"
              />
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded shadow-lg text-sm z-50">
                  <Link
                    to="#"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => {
                      setShowPopup(true);
                      setShowUserDropdown(false);
                    }}
                  >
                    Login
                  </Link>
                  <Link
                    to="#"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => {
                      setShowPopup(true);
                      setShowUserDropdown(false);
                    }}
                  >
                    Signup
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    Orders
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Toggle Button */}
            <div className="block lg:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <svg
                  className="w-6 h-6 text-gray-800 dark:text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden px-4 pt-2 pb-4 bg-white dark:bg-gray-700 shadow-md">
            <input
              type="search"
              placeholder="Search for items"
              className="w-full px-3 py-1 mb-3 rounded-md border dark:border-gray-600 dark:bg-gray-800 text-sm focus:outline-none"
            />
            <Link to="/uploadlist" className="block text-sm font-semibold hover:underline">
              Upload List
            </Link>
          </div>
        )}
      </nav>

      <SignUp showPopup={showPopup} setShowPopup={setShowPopup} />
    </>
  );
}
