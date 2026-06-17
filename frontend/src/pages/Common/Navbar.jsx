import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/authStore";

import {
  ShoppingCart,
  Menu,
  X,
  User,
  Search,
  Heart,
  ChevronDown,
  Package,
  LogOut,
  Moon,
  Sun,
  Settings,
  Zap,
  LayoutGrid,
  Milk,
  Apple,
  Leaf,
  Cookie,
  CupSoda,
} from "lucide-react";
import toast from "react-hot-toast";

// Normalized category paths to lowercase to eliminate conditional route mismatches
const CATEGORIES = [
  {
    name: "Products",
    link: "/products",
    icon: LayoutGrid,
    color: "text-emerald-500",
  },
  {
    name: "Dairy",
    link: "/dairy-products",
    icon: Milk,
    color: "text-blue-500",
  },
  {
    name: "Fruits",
    link: "/fruits",
    icon: Apple,
    color: "text-red-500",
  },
  {
    name: "Vegetables",
    link: "/vegetables",
    icon: Leaf,
    color: "text-green-600",
  },
  {
    name: "Snacks",
    link: "/snacks",
    icon: Cookie,
    color: "text-orange-500",
  },
  {
    name: "Beverages",
    link: "/beverages",
    icon: CupSoda,
    color: "text-purple-500",
  },
];

export default function Navbar() {
  const [lightMode, setLightMode] = useState(true);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [showPromo, setShowPromo] = useState(true);

  const { user, logout, isAuthenticated } = useAuthStore();
  const { getCartCount } = useCartStore();
  const navigate = useNavigate();
  const cartCount = isAuthenticated ? getCartCount() : 0;
  const location = useLocation();

  const userDropdownRef = useRef(null);
  const catDropdownRef = useRef(null);
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  // Measures layout headers securely to stabilize dynamic viewport blocks
  useEffect(() => {
    const measure = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    const timer = setTimeout(measure, 30);

    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", measure);
    };
  }, [location.pathname, showPromo, isScrolled]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      console.error(error);
      toast.error("Failed to logout");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setShowUserDropdown(false);
      }
      if (
        catDropdownRef.current &&
        !catDropdownRef.current.contains(event.target)
      ) {
        setShowCatDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setShowSidebar(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-0 left-0 w-full z-50 dark:bg-[#070d19] transition-colors duration-200 shadow-sm"
      >
        {/* Top promo strip */}
        {showPromo && (
          <div className="bg-[#00754a] text-white text-xs sm:text-sm py-2.5 px-4 flex items-center justify-center gap-2 relative font-medium border-b border-emerald-500/20">
            <Zap
              size={14}
              className="text-yellow-400 fill-yellow-400 shrink-0"
            />
            <span>
              Free Delivery on orders over ₹499!{" "}
              <a href="#" className="underline font-semibold ml-1">
                Shop Now
              </a>
            </span>
            <button
              onClick={() => setShowPromo(false)}
              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Main Navbar Row */}
        <nav className="border-b bg-[#070d19] border-gray-200/50 dark:border-gray-800/50 px-4 md:px-12 py-4">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-6">
            {/* Left side: Mobile menu toggle & Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                className="md:hidden w-11 h-11 flex items-center justify-center rounded-xl border border-gray-200/60 dark:border-gray-80 dark:bg-[#0b1426] text-gray-700 dark:text-gray-300 shadow-sm"
                onClick={() => setShowSidebar(true)}
              >
                <Menu size={20} />
              </button>

              <Link to="/" className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <span className="text-white font-black text-xl tracking-tighter">
                    LK
                  </span>
                </div>
                <div className="flex flex-col leading-tight hidden sm:flex">
                  <span className="text-2xl font-black text-[#0f172a] dark:text-white tracking-tight">
                    List<span className="text-[#00b074]">Karo</span>
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                    Sab kuch, ek jagah
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Center Expanded Search Bar */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-4xl relative items-center h-12 bg-[#0b1426] rounded-xl border border-gray-800 focus-within:border-emerald-500 transition-all shadow-sm"
            >
              <div className="relative h-full" ref={catDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowCatDropdown(!showCatDropdown)}
                  className="h-full flex items-center gap-1.5 pl-4 pr-3 text-gray-700 dark:text-gray-200 text-sm font-bold border-r border-gray-200/50 dark:border-gray-800/80"
                >
                  <LayoutGrid size={16} className="text-gray-400" />
                  Categories
                  <ChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform ${showCatDropdown ? "rotate-180" : ""}`}
                  />
                </button>
                {showCatDropdown && (
                  <div className="absolute top-[calc(100%+8px)] left-0 min-w-[200px] dark:bg-[#0b1426] rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 py-1.5 z-50">
                    {CATEGORIES.map((cat, idx) => {
                      const Icon = cat.icon;
                      return (
                        <Link
                          key={idx}
                          to={cat.link}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          onClick={() => setShowCatDropdown(false)}
                        >
                          <Icon size={16} className={cat.color} />
                          {cat.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for groceries, snacks, fruits..."
                className="flex-1 bg-transparent border-none text-gray-900 dark:text-white px-4 text-sm font-medium focus:outline-none focus:ring-0 placeholder-gray-400 dark:placeholder-gray-500"
              />

              <button
                type="submit"
                className="h-full px-6 bg-[#00b074] hover:bg-emerald-600 text-white flex items-center justify-center transition-colors rounded-r-xl"
              >
                <Search size={18} />
              </button>
            </form>

            {/* Right side utilities actions */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={toggleDarkMode}
                className="hidden md:flex w-11 h-11 items-center justify-center rounded-xl border border-gray-200/60 dark:border-gray-800/80 dark:bg-[#070d19] hover:dark:bg-[#070d19]/80 text-gray-700 dark:text-amber-400 shadow-[0_4px_12px_rgba(245,158,11,0.15)] dark:shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all duration-200"
                aria-label="Toggle Mode"
              >
                {lightMode ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              <Link
                to="/wishlist"
                className="hidden md:flex w-11 h-11 items-center justify-center rounded-xl border border-gray-200/60 dark:border-gray-800/80 dark:bg-[#070d19] hover:dark:bg-[#070d19]/80 text-gray-700 dark:text-gray-300 shadow-[0_4px_12px_rgba(244,63,94,0.15)] transition-all duration-200"
              >
                <Heart size={18} />
              </Link>

              <Link
                to="/shopping-cart"
                className="flex items-center gap-2 h-11 px-3 rounded-xl border border-gray-200/60 dark:border-gray-800/80 dark:bg-[#070d19] hover:dark:bg-[#070d19]/80 text-gray-700 dark:text-gray-300 shadow-[0_4px_12px_rgba(234,179,8,0.15)] transition-all duration-200"
              >
                <div className="relative">
                  <ShoppingCart
                    size={18}
                    className="text-gray-700 dark:text-gray-300"
                  />
                  <span className="absolute -top-2.5 -right-2.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount > 0 ? cartCount : 3}
                  </span>
                </div>
                <span className="font-bold text-gray-800 dark:text-white text-xs mt-0.5">
                  ₹0.00
                </span>
              </Link>

              {/* Profile Menu */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 h-11 pl-2 pr-3 rounded-xl border border-gray-200/60 dark:border-gray-800 dark:bg-[#070d19] hover:dark:bg-[#070d19]/80 text-gray-800 dark:text-gray-200 text-sm font-bold shadow-[0_4px_12px_rgba(16,185,129,0.15)] dark:shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <User size={15} />
                  </div>
                  <span className="hidden sm:inline">
                    {isAuthenticated
                      ? user?.name?.split(" ")[0] || "Profile"
                      : "Sign In"}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform ${showUserDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 dark:bg-[#070d19] rounded-xl border border-gray-200/60 dark:border-gray-800 py-1.5 z-50 overflow-hidden shadow-[0_10px_25px_rgba(59,130,246,0.12)] dark:shadow-[0_10px_30px_rgba(10,18,31,0.8),_0_0_20px_rgba(59,130,246,0.15)]">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            {user?.name}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate">
                            {user?.email}
                          </p>
                        </div>
                        <div className="p-1.5 space-y-0.5">
                          <Link
                            to="/profile"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            onClick={() => setShowUserDropdown(false)}
                          >
                            <Settings size={15} /> Account Settings
                          </Link>
                          <Link
                            to="/orderlisting"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            onClick={() => setShowUserDropdown(false)}
                          >
                            <Package size={15} /> Orders
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-600 font-medium hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                          >
                            <LogOut size={15} /> Logout
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                          Access account & orders
                        </p>
                        <Link
                          to="/login"
                          className="block w-full py-2 bg-[#00b074] hover:bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-[0_4px_12px_rgba(0,176,116,0.2)] transition-all"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          Sign In
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Dynamic Static Categorization Row for Desktop views */}
        <div className="hidden md:block border-b border-gray-800/50 py-2 bg-[#070d19] transition-all duration-300">
          <div className="max-w-4xl mx-auto border border-gray-800/80 rounded-xl bg-[#0b1426] p-1.5 flex items-center justify-around shadow-sm">
            {CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;

              // FIXED MISMAtCH: We verify downcased routes to block navigation layouts breaking or jumping
              const currentPathClean = location.pathname.toLowerCase();
              const catLinkClean = cat.link.toLowerCase();

              const active =
                currentPathClean === catLinkClean ||
                (idx === 0 &&
                  (currentPathClean === "/products" ||
                    currentPathClean.startsWith("/product/")));

              return (
                <Link
                  key={idx}
                  to={cat.link}
                  className={`flex items-center gap-2 px-2 py-2.5 rounded-lg text-sm font-bold transition-all relative ${
                    active
                      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                  }`}
                >
                  <Icon size={16} className={cat.color} />
                  {cat.name}
                  {active && (
                    <span className="absolute bottom-0 left-5 right-5 h-[2px] bg-emerald-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile Responsive Drawer Menu Bar */}
        {showSidebar && (
          <>
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9998] transition-opacity"
              onClick={() => setShowSidebar(false)}
            ></div>

            <div className="fixed inset-y-0 left-0 w-[85vw] max-w-[300px] bg-[#111827] dark:bg-[#090d16] border-r border-gray-800 shadow-2xl z-[9999] flex flex-col transition-transform duration-200">
              <div className="p-5 sm:p-6 bg-gradient-to-b from-[#00b074] to-[#111827] dark:from-[#044e34] dark:to-[#090d16] text-white relative overflow-hidden shrink-0 border-b border-gray-800">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400 rounded-full mix-blend-screen filter blur-[40px] opacity-25"></div>

                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                    <span className="text-white font-black text-base tracking-tighter">
                      LK
                    </span>
                  </div>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md border border-white/10"
                  >
                    <X size={18} className="text-white" />
                  </button>
                </div>

                <div className="relative z-10">
                  {isAuthenticated ? (
                    <>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[11px] font-bold text-emerald-300 mb-2">
                        <User size={10} /> Member
                      </span>
                      <h3 className="font-bold text-lg mb-0.5 text-white">
                        {user?.name}
                      </h3>
                      <p className="text-gray-400 text-xs truncate font-medium">
                        {user?.email}
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="font-bold text-lg mb-1 text-white">
                        User
                      </h3>
                      <p className="text-gray-300 text-xs font-semibold mb-4 flex items-center gap-1">
                        Welcome to ListKaro{" "}
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      </p>
                      <div className="flex gap-3 text-sm">
                        <Link
                          to="/login"
                          onClick={() => setShowSidebar(false)}
                          className="flex-1 text-center bg-white hover:bg-gray-100 text-gray-900 py-2.5 rounded-xl font-bold transition-colors shadow-md text-xs"
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/signup"
                          onClick={() => setShowSidebar(false)}
                          className="flex-1 text-center bg-white/10 hover:bg-white/20 text-white border border-white/20 py-2.5 rounded-xl font-bold transition-colors text-xs"
                        >
                          Sign Up
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6 bg-[#111827] dark:bg-[#090d16]">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-855 dark:bg-gray-900 border border-gray-700/60 rounded-xl text-xs font-medium text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-shadow"
                    />
                    <Search
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </form>

                <div>
                  <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1">
                    Top Categories
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {CATEGORIES.map((cat, idx) => {
                      const Icon = cat.icon;
                      return (
                        <Link
                          key={idx}
                          to={cat.link}
                          onClick={() => setShowSidebar(false)}
                          className="flex flex-col items-center justify-center text-center p-2 rounded-xl bg-gray-850/50 dark:bg-gray-900/40 border border-gray-800 hover:border-emerald-500/30 transition-all group"
                        >
                          <div className="p-2 rounded-lg bg-gray-800 dark:bg-gray-950 mb-1 group-hover:scale-105 transition-transform">
                            <Icon size={16} className={cat.color} />
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 group-hover:text-white transition-colors truncate w-full">
                            {cat.name.split(" ")[0]}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <hr className="border-gray-800" />

                <div className="space-y-1">
                  <Link
                    to="/uploadlist"
                    onClick={() => setShowSidebar(false)}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-xs font-bold text-gray-300 hover:bg-gray-800/40 hover:text-white transition-colors"
                  >
                    <Zap size={16} className="text-emerald-400 shrink-0" />
                    One Click Shopping
                  </Link>
                  <Link
                    to="/order"
                    onClick={() => setShowSidebar(false)}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-xs font-bold text-gray-300 hover:bg-gray-800/40 hover:text-white transition-colors"
                  >
                    <Package size={16} className="text-blue-400 shrink-0" />
                    My Orders
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => setShowSidebar(false)}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-xs font-bold text-gray-300 hover:bg-gray-800/40 hover:text-white transition-colors"
                  >
                    <Heart size={16} className="text-pink-400 shrink-0" />
                    Wishlist
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setShowSidebar(false)}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-xs font-bold text-gray-300 hover:bg-gray-800/40 hover:text-white transition-colors"
                  >
                    <Settings size={16} className="text-gray-400 shrink-0" />
                    Account Settings
                  </Link>
                </div>
              </div>

              {/* Mobile Drawer Bottom Action Bar */}
              <div className="p-4 border-t border-gray-800 bg-[#0e1420] shrink-0 space-y-3">
                <div className="flex items-center justify-between bg-gray-800/50 p-1 rounded-xl border border-gray-700/40">
                  <button
                    type="button"
                    onClick={() => {
                      if (!lightMode) toggleDarkMode();
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${lightMode ? "bg-[#00b074] text-white shadow-sm" : "text-gray-400 hover:text-gray-200"}`}
                  >
                    <Sun size={14} /> Light
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (lightMode) toggleDarkMode();
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${!lightMode ? "bg-emerald-600 text-white shadow-sm" : "text-gray-400 hover:text-gray-200"}`}
                  >
                    <Moon size={14} /> Dark
                  </button>
                </div>

                {isAuthenticated && (
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-red-950/30 hover:bg-red-950/50 text-red-400 border border-red-900/30 rounded-xl text-xs font-bold transition-colors"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </header>

      {/* Spacer panel block */}
      <div
        style={{ height: headerHeight }}
        aria-hidden="true"
        className="w-full block"
      />
    </>
  );
}
