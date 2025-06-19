import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from '../store/authStore';
import { ShoppingCart, Menu, X, User, Upload, Info, Package, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from "../store/authStore";
import './Home.css';
import './HomeDark.css';

export default function Navbar() {
    const [showPopup, setShowPopup] = useState(false);
    const [lightMode, setLightMode] = useState(true);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [showSubTabs, setShowSubTabs] = useState(false);
    const { user, logout, isAuthenticated } = useAuthStore();
    const { getCartCount } = useCartStore();
    const navigate = useNavigate();
    const cartCount = isAuthenticated ? getCartCount() : 0;

    const userDropdownRef = useRef(null);
    const sidebarRef = useRef(null);

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

    const handleClickOutside = (event) => {
        if (
            userDropdownRef.current &&
            !userDropdownRef.current.contains(event.target)
        ) {
            setShowUserDropdown(false);
        }

        if (
            sidebarRef.current &&
            !sidebarRef.current.contains(event.target) &&
            !event.target.closest(".nav-toggle-icon")
        ) {
            setShowSidebar(false);
        }
    };

    const handleAdmin = () => {
        if (!isAuthenticated) {
            toast.error("Please login!");
            navigate("/login");
        } else if (user.role === "admin") {
            navigate("/adminpanel");
        } else {
            toast.error("Access denied. Please login as Admin.");
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            <nav className="my-navbar fixed top-0 z-50 dark:bg-gray-800 text-gray-800 dark:text-white shadow-md w-full duration-300">
                <div className="nav-holder max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <img src="/images/logo.png" alt="logo" className="h-8 w-8" />
                        <Link to="/" className="text-xl font-bold my-brand">ListKaro</Link>
                    </div>

                    <div className="hidden lg:flex items-center gap-4">
                        <input
                            type="search"
                            placeholder="Search for items"
                            className="searchinput px-3 py-1 rounded-md border dark:border-gray-600 dark:bg-gray-700 text-sm focus:outline-none"
                        />
                        <Link to="/uploadlist" className="flex gap-2 text-sm font-semibold upload-list-lg">
                            <Upload size={20} className="text-gray-800 dark:text-white" />One Click Shopping
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/shopping-cart" className="relative px-1 py-1 rounded-md text-sm hover:bg-green-700 transition">
                            <ShoppingCart size={24} className="nav-cart-icon" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">{cartCount}</span>
                            )}
                        </Link>

                        <img
                            src={lightMode ? "/images/sun.png" : "/images/moon.png"}
                            onClick={toggleDarkMode}
                            alt="Toggle Theme"
                            className="w-6 h-6 cursor-pointer"
                        />

                        {/* 👇 Login/Profile Icon Section */}
                        <div className="relative" ref={userDropdownRef}>
                            <div
                                onClick={() => setShowUserDropdown(!showUserDropdown)}
                                className="cursor-pointer flex items-center gap-1 px-2 py-1 rounded bg-green-950 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out"
                            >

                                {isAuthenticated ? (
                                    <>
                                        <User className="text-green-600" size={22} />
                                        <span>{user?.name?.split(" ")[0] || "Profile"}</span>
                                    </>
                                ) : (
                                    <>
                                        <User className="text-amber-600 " size={22} />
                                        <span>Login</span>
                                    </>
                                )}
                            </div>

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
                                                onClick={() => setShowUserDropdown(false)}
                                            >
                                                Login
                                            </Link>
                                            <Link
                                                to="/signup"
                                                className="block px-4 py-2 text-bold hover:bg-gray-100 dark:hover:bg-gray-600 nav-dropdown-link"
                                                onClick={() => setShowUserDropdown(false)}
                                            >
                                                Signup
                                            </Link>
                                        </>
                                    )}
                                    {isAuthenticated && (
                                        <Link
                                            to="/orders"
                                            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 nav-dropdown-link uorders"
                                        >
                                            <Package className="w-5 h-5" /> Your Orders
                                        </Link>
                                    )}
                                    <hr className="border-gray-600 my-2" />
                                    {isAuthenticated && (
                                        <Link
                                            to="/"
                                            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 nav-dropdown-link ulogout"
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="w-5 h-5" /> Logout
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="block">
                            <button onClick={() => setShowSidebar(true)}>
                                <Menu className="w-6 h-6 nav-toggle-icon dark:text-white" />
                            </button>
                        </div>
                    </div>
                </div>

                {showSidebar && (
                    <div
                        ref={sidebarRef}
                        className="fixed top-0 right-0 h-full w-80 nav-mob-screen-dropdown shadow-lg z-50 transform transition-transform duration-300 ease-in-out translate-x-0"
                    >
                        <div className="flex justify-between items-center p-4 border-b dark:border-gray-600 bg-orange-300 menuheader">
                            <span className="text-lg font-semibold nav-sidebarheader-text dark:text-white">Menu</span>
                            <button onClick={() => setShowSidebar(false)}>
                                <X className="w-5 h-5 nav-sidebar-close" />
                            </button>
                        </div>

                        <div className="menucontainer p-0 bg-orange-200 h-full">
                            <input type="search" placeholder="Search for items" className="searchinput m-4 w-full px-3 py-2 mb-4 rounded-md border dark:border-gray-600 dark:bg-gray-700 text-sm focus:outline-none" />
                            <Link to="/uploadlist" className="flex gap-2 items-center text-sm font-semibold upload-list px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                                <Upload size={20} className="text-gray-800 dark:text-white" />
                                One Click Shopping
                            </Link>

                            <div>
                                <Link
                                    to="#"
                                    className="flex items-center gap-2 text-sm font-semibold upload-list px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={() => setShowSubTabs(prev => !prev)}
                                >
                                    <Package size={20} className="text-gray-800 dark:text-white" />
                                    All Products
                                </Link>

                                {showSubTabs && (
                                    <div className="pl-6 mt-2 space-y-2">
                                        <Link to="/dairy-products" className="block text-sm no-underline text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded">Dairy Products</Link>
                                        <Link to="/Fruits" className="block text-sm no-underline text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded">Fruits</Link>
                                        <Link to="/vegetables" className="block text-sm no-underline text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded">Vegetables</Link>
                                        <Link to="/canned-products" className="block text-sm no-underline text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded">Canned Products</Link>
                                        <Link to="/products" className="block text-sm no-underline text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded">All Products</Link>
                                    </div>
                                )}
                            </div>

                            <Link to="/about" className="flex items-center gap-2 text-sm font-semibold upload-list px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                                <Info size={20} className="text-gray-800 dark:text-white" />
                                About
                            </Link>

                            <button
                                onClick={handleAdmin}
                                className="flex items-center gap-2 text-sm font-semibold upload-list px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <Info size={20} className="text-gray-800 dark:text-white" />
                                Admin Panel
                            </button>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}
