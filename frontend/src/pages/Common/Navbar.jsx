import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from '../../store/authStore';
import { ShoppingCart, Menu, X, User, Upload, Info, Package, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from "../../store/authStore";
import '../Home/Home.css';
import '../Home/HomeDark.css';

export default function Navbar() {
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

    // --- Theme Logic ---
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

    // --- Logout Logic ---
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

    // --- Click Outside Logic ---
    const handleClickOutside = (event) => {
        if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
            setShowUserDropdown(false);
        }
        if (sidebarRef.current && !sidebarRef.current.contains(event.target) && !event.target.closest(".nav-toggle-icon")) {
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
            {/* 1. FIXED HEADER WRAPPER (This holds both Nav and Categories) */}
            <header className="fixed top-0 left-0 w-full z-50 shadow-md bg-white dark:bg-gray-800 transition-colors duration-300">

                {/* --- MAIN NAVBAR --- */}
                <nav className=" dark:bg-gray-800 text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <img src="/images/logo.png" alt="logo" className="h-8 w-8" />
                            <Link to="/" className="text-xl font-bold my-brand">ListKaro</Link>
                        </div>

                        {/* Search Bar (Desktop) */}
                        <div className="hidden lg:flex items-center gap-4">
                            <input
                                type="search"
                                placeholder="Search for items"
                                className="searchinput px-3 py-1 rounded-md border text-sm focus:outline-none"
                            />
                            <Link to="/uploadlist" className="flex gap-2 text-sm font-semibold upload-list-lg">
                                <Upload size={20} /> One Click Shopping
                            </Link>
                        </div>

                        {/* Right Actions */}
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

                            {/* User Dropdown */}
                            <div className="relative" ref={userDropdownRef}>
                                <div
                                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                                    className="cursor-pointer flex items-center gap-1 px-2 py-1 rounded bg-green-900 text-white hover:bg-green-800 transition"
                                >
                                    {isAuthenticated ? (
                                        <>
                                            <User className="text-green-400" size={20} />
                                            <span>{user?.name?.split(" ")[0] || "Profile"}</span>
                                        </>
                                    ) : (
                                        <>
                                            <User className="text-amber-400" size={20} />
                                            <span>Login</span>
                                        </>
                                    )}
                                </div>

                                {showUserDropdown && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow-xl text-sm z-[60]">
                                        {isAuthenticated && (
                                            <div className="px-4 py-3 text-gray-700 dark:text-gray-200 border-b dark:border-gray-700">
                                                Hello, <b>{user?.name}</b>
                                            </div>
                                        )}
                                        {!isAuthenticated ? (
                                            <>
                                                <Link to="/login" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setShowUserDropdown(false)}>Login</Link>
                                                <Link to="/signup" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setShowUserDropdown(false)}>Signup</Link>
                                            </>
                                        ) : (
                                            <>
                                                <Link to="/orders" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setShowUserDropdown(false)}>
                                                    <Package size={16} /> Your Orders
                                                </Link>
                                                <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                    <LogOut size={16} /> Logout
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            <button onClick={() => setShowSidebar(true)}>
                                <Menu className="w-6 h-6 nav-toggle-icon dark:text-white" />
                            </button>
                        </div>
                    </div>
                </nav>

                {/* --- CATEGORY BAR --- */}
                <div className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600 py-2 overflow-x-auto no-scrollbar w-full">
                    <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 text-sm font-medium whitespace-nowrap">
                        <button onClick={() => setShowSidebar(true)} className="flex items-center gap-1 hover:text-green-600 transition dark:text-white">
                            <Menu size={18} /> All
                        </button>
                        <Link to="/products" className="category-links no-underline transition">All Products</Link>
                        <Link to="/dairy-products" className="category-links no-underline transition">Dairy Products</Link>
                        <Link to="/Fruits" className="category-links no-underline transition">Fruits</Link>
                        <Link to="/vegetables" className="category-links no-underline transition">Vegetables</Link>
                        <Link to="/canned-products" className="category-links no-underline transition">Canned Products</Link>
                        <Link to="/snacks" className="category-links no-underline transition">Snacks & Munchies</Link>
                        <Link to="/beverages" className="category-links no-underline transition">Beverages</Link>
                    </div>
                </div>
            </header>

            {/* 2. SPACER (Prevents page content from hiding behind the fixed header) */}
            <div className="h-[108px]"></div>

            {/* 3. SIDEBAR DRAWER */}
            {showSidebar && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60]" onClick={() => setShowSidebar(false)}></div>

                    <div
                        ref={sidebarRef}
                        className="fixed top-0 right-0 h-full w-80 bg-orange-200 dark:bg-gray-900 shadow-2xl z-[70] transform transition-transform duration-300 translate-x-0"
                    >
                        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 bg-orange-300 dark:bg-gray-800">
                            <span className="text-lg font-bold dark:text-white">Menu</span>
                            <button onClick={() => setShowSidebar(false)}>
                                <X className="w-6 h-6 dark:text-white" />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            <input type="search" placeholder="Search..." className="w-full px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-700" />
                            <Link to="/uploadlist" className="flex items-center gap-2 font-semibold"><Upload size={18} /> One Click Shopping</Link>

                            <div>
                                <button onClick={() => setShowSubTabs(!showSubTabs)} className="flex items-center gap-2 font-semibold w-full">
                                    <Package size={18} /> All Products
                                </button>
                                {showSubTabs && (
                                    <div className="pl-6 mt-2 space-y-2 text-sm">
                                        <Link to="/dairy-products" className="block">Dairy Products</Link>
                                        <Link to="/Fruits" className="block">Fruits</Link>
                                        <Link to="/vegetables" className="block">Vegetables</Link>
                                    </div>
                                )}
                            </div>

                            <Link to="/about" className="flex items-center gap-2 font-semibold"><Info size={18} /> About</Link>
                            <button onClick={handleAdmin} className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-400">
                                <User size={18} /> Admin Panel
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}