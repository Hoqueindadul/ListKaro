import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowRight,
  Truck,
  Clock,
  ShieldCheck,
  Upload,
  ChevronLeft,
  ChevronRight,
  Star,
  Sparkles,
  Gift,
  Zap,
} from "lucide-react";

const CATEGORIES = [
  { name: "Fruits", img: "/images/fruits.jpg", link: "/Fruits" },
  { name: "Vegetables", img: "/images/vege.jpg", link: "/vegetables" },
  { name: "Dairy", img: "/images/c3.jpg", link: "/dairy-products" },
  { name: "Meat", img: "/images/meat.jpg", link: "/meat" },
  { name: "Snacks", img: "/images/snacks.jpg", link: "/snacks" },
  { name: "Drinks", img: "/images/drink.jpg", link: "/beverages" },
  { name: "Frozen", img: "/images/frozen.jpg", link: "/frozen" },
  { name: "Sweets", img: "/images/sweet.jpg", link: "/sweets" },
  { name: "Canned", img: "/images/canned.jpg", link: "/canned-products" },
  { name: "Bakery", img: "/images/cake.jpg", link: "/bakery" },
  { name: "Rice & Grains", img: "/images/rice.jpg", link: "/rice" },
  { name: "Biscuits", img: "/images/biscuit.jpg", link: "/biscuits" },
];

const HERO_SLIDES = [
  {
    img: "/images/c1.jpg",
    title: "Farm Fresh\nDelivered Daily",
    subtitle: "Quality groceries at your doorstep in 45 minutes",
    cta: "Shop Now",
    link: "/products",
  },
  {
    img: "/images/c2.jpg",
    title: "Save Big on\nWeekly Essentials",
    subtitle: "Up to 50% off on fruits, vegetables & dairy",
    cta: "View Offers",
    link: "/products",
  },
  {
    img: "/images/c3.jpg",
    title: "One Click\nShopping List",
    subtitle: "Upload your list and we'll prepare everything",
    cta: "Try Now",
    link: "/uploadlist",
  },
];

function Home() {
  const [offerPopup, setOfferPopup] = useState(false);
  const [offerPopupClose, setOfferPopupClose] = useState(false);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const categoryScrollRef = useRef(null);
  const slideInterval = useRef(null);

  // Auto-slide hero
  useEffect(() => {
    slideInterval.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(slideInterval.current);
  }, []);

  // Offer popup timer
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!offerPopupClose) setOfferPopup(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, [offerPopupClose]);

  const closeOfferPopup = () => {
    setOfferPopup(false);
    setOfferPopupClose(true);
  };

  const copyText = () => {
    navigator.clipboard.writeText("J&M").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 5000);
    });
  };

  const handleEmailSubmission = async (e) => {
    e.preventDefault();
    if (!email) {
      alert("Please enter a valid email address.");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/subscribe", {
        email,
      });
      alert(res.data.message);
      setEmail("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed! Something went wrong.");
    }
  };

  const goToSlide = (index) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    clearInterval(slideInterval.current);
    slideInterval.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const nextSlide = () => goToSlide((currentSlide + 1) % HERO_SLIDES.length);
  const prevSlide = () =>
    goToSlide((currentSlide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  const scrollCategories = (dir) => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({
        left: dir === "left" ? -280 : 280,
        behavior: "smooth",
      });
    }
  };

  const [lightMode, setLightMode] = useState(true);
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setLightMode(false);
    } else {
      setLightMode(true);
    }
  }, []);

  return (
    <div className="min-h-screen font-sans transition-colors duration-300">
      {/* ========== OFFER POPUP ========== */}
      {offerPopup && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeOfferPopup}
        >
          <div
            className=" dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full relative shadow-2xl border border-slate-100 dark:border-slate-700 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold p-1"
              onClick={closeOfferPopup}
            >
              ✕
            </button>
            <div className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 mx-auto">
              <Gift size={14} /> Limited Time
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              GET UP TO 50% OFF
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              Starting from ₹199/- Use Code{" "}
              <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-bold mx-1 dark:bg-emerald-500/10 dark:text-emerald-400">
                J&M
              </span>{" "}
              and enjoy 50% off up to ₹250/-
            </p>
            <button
              onClick={copyText}
              className="w-full h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-xl text-xs tracking-wide transition-all duration-300 transform active:scale-[0.98] shadow-[0_4px_20px_rgba(6,182,212,0.25)] flex items-center justify-center cursor-pointer"
            >
              {copied ? "✓ Copied Code!" : "Copy Code"}
            </button>
          </div>
        </div>
      )}

      {/* ========== HERO SECTION ========== */}
      <section className="relative h-[500px] md:h-[650px] overflow-hidden bg-slate-950">
        <div className="relative w-full h-full">
          {HERO_SLIDES.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}
            >
              <img
                src={slide.img}
                alt=""
                className="w-full h-full object-cover transform scale-105 transition-transform duration-[5000ms] ease-out object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 top-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center text-white z-20">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight whitespace-pre-line leading-tight drop-shadow-sm">
                  {slide.title}
                </h1>
                <p className="mt-4 text-base sm:text-lg md:text-xl text-slate-200 max-w-md drop-shadow">
                  {slide.subtitle}
                </p>
                <div className="mt-8">
                  <Link
                    to={slide.link}
                    className="inline-flex items-center justify-center gap-2 px-6 h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-xl text-xs tracking-wide transition-all duration-300 transform active:scale-[0.98] shadow-[0_4px_20px_rgba(6,182,212,0.25)]"
                  >
                    {slide.cta} <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Hero Navigation Arrows */}
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 transition-all"
          onClick={prevSlide}
          aria-label="Previous slide"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 transition-all"
          onClick={nextSlide}
          aria-label="Next slide"
        >
          <ChevronRight size={22} />
        </button>

        {/* Hero Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2.5">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === currentSlide ? "bg-cyan-400 w-8" : "bg-white/40 hover:bg-white/60"}`}
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ========== FEATURES BAR ========== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-30 mb-16">
        <div className="dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700/50 p-6 md:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-3 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-xl">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                45 Min Delivery
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Lightning fast to your door
              </p>
            </div>
          </div>
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                100% Fresh
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Quality guaranteed always
              </p>
            </div>
          </div>
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <Clock size={24} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                Easy Returns
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                No questions asked
              </p>
            </div>
          </div>
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
              <Zap size={24} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                Best Prices
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Save more every day
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CATEGORIES ========== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Shop by Category
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Browse through our wide range of products
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scrollCategories("left")}
              className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-md active:scale-95 transition-all cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scrollCategories("right")}
              className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-md active:scale-95 transition-all cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div
          className="flex gap-5 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
          ref={categoryScrollRef}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {CATEGORIES.map((cat, idx) => (
            <Link
              to={cat.link}
              key={idx}
              className="flex-none w-36 sm:w-44 dark:bg-slate-800 rounded-2xl p-3 border border-slate-100 dark:border-slate-700/50 text-center shadow-sm group hover:shadow-md hover:border-cyan-300 dark:hover:border-cyan-500/30 transition-all duration-300 snap-start"
            >
              <div className="aspect-square rounded-xl bg-slate-50 dark:bg-slate-900 overflow-hidden mb-3">
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm group-hover:text-cyan-500 transition-colors block truncate">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ========== PROMO CARDS ========== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="bg-[#031424] rounded-3xl p-8 lg:p-12 shadow-2xl border border-slate-800/40 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* ===== LEFT COLUMN: Snacks & Munchies Content ===== */}
          <div className="lg:col-span-4 flex flex-col items-start space-y-4">
            <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
              🔥 TRENDING
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Snacks & Munchies
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed break-words whitespace-normal max-w-sm">
              Explore our wide range of crispy chips & healthy snacks perfect
              for your cravings!
            </p>

            {/* Coupon Tag Container */}
            <div className="flex items-center gap-2 bg-[#061b2e] border border-slate-800/60 rounded-xl px-3 py-2 text-xs w-full max-w-xs">
              <span className="text-slate-400">
                Use Code: <strong className="text-amber-400">IamHungry</strong>
              </span>
              <span className="ml-auto font-black bg-yellow-400 text-slate-950 px-1.5 py-0.5 rounded text-[10px]">
                20% OFF
              </span>
            </div>

            {/* Modern Gradient Button */}
            <Link
              to="/products"
              className="w-full max-w-xs h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-xl text-xs tracking-wide transition-all duration-300 transform active:scale-[0.98] shadow-[0_4px_20px_rgba(6,182,212,0.25)] flex items-center justify-center gap-1 cursor-pointer"
            >
              Shop Now <ArrowRight size={14} />
            </Link>
          </div>

          {/* ===== CENTER COLUMN: Main Image Focus ===== */}
          <div className="lg:col-span-4 aspect-square max-w-[320px] mx-auto w-full rounded-2xl overflow-hidden shadow-xl border border-slate-800/40">
            <img
              src="/images/snacks.jpg"
              alt="Snacks Preview"
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* ===== RIGHT COLUMN: Daily Essentials Content ===== */}
          <div className="lg:col-span-4 flex flex-col items-start space-y-4">
            <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
              🌿 FRESH
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Daily Essentials
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed break-words whitespace-normal max-w-sm">
              From farm-fresh vegetables to premium pantry staples, everything
              you need in one place.
            </p>

            {/* Coupon Tag Container */}
            <div className="flex items-center gap-2 bg-[#061b2e] border border-slate-800/60 rounded-xl px-3 py-2 text-xs w-full max-w-xs">
              <span className="text-slate-400">
                Use Code:{" "}
                <strong className="text-emerald-400">FreshStart</strong>
              </span>
              <span className="ml-auto font-black bg-emerald-400 text-slate-950 px-1.5 py-0.5 rounded text-[10px]">
                10% OFF
              </span>
            </div>

            {/* Modern Gradient Button */}
            <Link
              to="/products"
              className="w-full max-w-xs h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-xl text-xs tracking-wide transition-all duration-300 transform active:scale-[0.98] shadow-[0_4px_20px_rgba(6,182,212,0.25)] flex items-center justify-center gap-1 cursor-pointer"
            >
              Shop Now <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ========== DEAL OF THE DAY ========== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="bg-gradient-to-br from-rose-500 to-orange-500 dark:from-rose-600 dark:to-orange-600 rounded-3xl overflow-hidden shadow-xl p-8 md:p-12 lg:p-16 relative flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Left Side: Image */}
          <div className="relative w-50 h-50 sm:w-60 sm:h-60 flex-shrink-0">
            <img
              src="/images/juice.png"
              alt="Summer Offer"
              className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.25)]"
            />
            <div className="absolute top-0 right-0 bg-yellow-400 text-slate-950 w-16 h-16 rounded-full flex flex-col items-center justify-center font-black rotate-12 shadow-md">
              <span className="text-base leading-none">20%</span>
              <span className="text-[10px] uppercase tracking-wider leading-none">
                OFF
              </span>
            </div>
          </div>

          {/* Right Side: Text Content */}
          <div className="text-white text-center md:text-left flex-grow flex flex-col items-center md:items-start">
            <span className="inline-flex items-center gap-1 bg-white/20 text-white backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <Star size={12} className="fill-white" /> Deal of the Day
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
              GET REFRESHED THIS SUMMER! ☀️
            </h2>
            <p className="text-rose-50/90 max-w-xl mb-6 leading-relaxed text-center md:text-left">
              Beat the heat. Buy 2 bottles of refreshing pure Orange Juice and
              get one absolutely Free!
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2">
              <span className="text-xl line-through text-rose-200/70 font-semibold">
                ₹99
              </span>
              <span className="text-4xl font-black tracking-tight">₹79</span>
              <span className="bg-white text-rose-600 font-bold px-2.5 py-1 rounded-lg text-xs shadow-sm">
                Save ₹20
              </span>
            </div>
            <p className="text-[10px] text-rose-100/60 mb-6">
              *Terms and Conditions applicable
            </p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 px-6 h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-xl text-xs tracking-wide transition-all duration-300 transform active:scale-[0.98] shadow-[0_4px_20px_rgba(6,182,212,0.25)] max-w-xs md:w-auto"
            >
              Grab This Deal <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ========== ONE CLICK SHOPPING ========== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-xl overflow-hidden grid lg:grid-cols-12 gap-8 items-center p-6 sm:p-8 lg:p-12">
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-1 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Zap size={12} /> Smart Feature
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
              One Click Shopping
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-xl">
              Upload your handwritten or typed grocery list and we'll
              automatically prepare your full cart. No more infinite
              browsing—just upload, verify, and check out!
            </p>

            <div className="grid sm:grid-cols-3 gap-4 py-2">
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/30">
                <div className="w-7 h-7 rounded-full bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center shadow-sm">
                  1
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Upload list
                </span>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/30">
                <div className="w-7 h-7 rounded-full bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center shadow-sm">
                  2
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  We prepare it
                </span>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/30">
                <div className="w-7 h-7 rounded-full bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center shadow-sm">
                  3
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Delivered to you
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/uploadlist"
                className="inline-flex items-center justify-center gap-2 px-6 h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-xl text-xs tracking-wide transition-all duration-300 transform active:scale-[0.98] shadow-[0_4px_20px_rgba(6,182,212,0.25)] max-w-xs md:w-auto"
              >
                <Upload size={14} /> Upload Your List
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 h-64 lg:h-full min-h-[280px] rounded-2xl overflow-hidden shadow-inner relative group">
            <img
              src="/images/shopping.jpg"
              alt="One Click Shopping"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </section>

      {/* ========== NEWSLETTER ========== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 dark:from-slate-850 dark:to-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-800 grid md:grid-cols-12 gap-8 items-center p-8 sm:p-10 lg:p-14">
          <div className="md:col-span-7 text-white space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Get Top Deals, Latest Trends & More
            </h2>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Join our exclusive inner circle to get early updates on weekly
              flash promotions, custom coupons, and special deals.
            </p>

            <form
              className="flex flex-col sm:flex-row gap-3 pt-2 max-w-md"
              onSubmit={handleEmailSubmission}
            >
              <input
                type="email"
                placeholder="Enter your email address"
                className="bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent flex-grow transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="h-11 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-xl text-xs tracking-wide transition-all duration-300 transform active:scale-[0.98] shadow-[0_4px_20px_rgba(6,182,212,0.25)] flex items-center justify-center whitespace-nowrap cursor-pointer"
              >
                Subscribe
              </button>
            </form>
            <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
              🔒 We respect your privacy. Unsubscribe anytime.
            </p>
          </div>

          <div className="md:col-span-5 h-48 md:h-full flex items-center justify-center">
            <img
              src={
                lightMode
                  ? "/images/newsletterday.png"
                  : "/images/newsletternight.png"
              }
              alt="Newsletter"
              className="max-h-56 w-auto rounded-2xl object-contain drop-shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="w-full text-slate-400 dark:text-slate-400 transition-colors duration-300 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Link Grid */}
          <div className="py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5 border-t border-slate-200/10">
            {/* Brand Profile Section */}
            <div className="col-span-1 space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20">
                  <img
                    src="/images/logo.png"
                    alt="ListKaro"
                    className="h-7 w-auto object-contain"
                  />
                </div>
                <span className="font-black text-2xl text-white tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  ListKaro
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Your premium, ultra-fast hub for fresh groceries, home staples,
                and essentials delivered directly to your doorstep in 45 minutes
                flat.
              </p>
            </div>

            {/* Category Links Column */}
            <div className="flex flex-col space-y-3.5">
              <h4 className="font-bold text-white tracking-wider text-[11px] uppercase opacity-90">
                Categories
              </h4>
              <div className="flex flex-col space-y-2.5 text-xs">
                <Link
                  to="/dairy-products"
                  className="hover:text-cyan-400 transform hover:translate-x-1 transition-all duration-200 text-slate-400"
                >
                  Dairy Products
                </Link>
                <Link
                  to="/Fruits"
                  className="hover:text-cyan-400 transform hover:translate-x-1 transition-all duration-200 text-slate-400"
                >
                  Fruits & Berries
                </Link>
                <Link
                  to="/vegetables"
                  className="hover:text-cyan-400 transform hover:translate-x-1 transition-all duration-200 text-slate-400"
                >
                  Fresh Vegetables
                </Link>
                <Link
                  to="/canned-products"
                  className="hover:text-cyan-400 transform hover:translate-x-1 transition-all duration-200 text-slate-400"
                >
                  Canned Packets
                </Link>
                <Link
                  to="/snacks"
                  className="hover:text-cyan-400 transform hover:translate-x-1 transition-all duration-200 text-slate-400"
                >
                  Snacks & Treats
                </Link>
              </div>
            </div>

            {/* About Us Links Column */}
            <div className="flex flex-col space-y-3.5">
              <h4 className="font-bold text-white tracking-wider text-[11px] uppercase opacity-90">
                About Us
              </h4>
              <div className="flex flex-col space-y-2.5 text-xs">
                <Link
                  to="/about"
                  className="hover:text-cyan-400 transform hover:translate-x-1 transition-all duration-200 text-slate-400"
                >
                  Our Company
                </Link>
                <Link
                  to="/about"
                  className="hover:text-cyan-400 transform hover:translate-x-1 transition-all duration-200 text-slate-400"
                >
                  Developers Team
                </Link>
                <Link
                  to="/about"
                  className="hover:text-cyan-400 transform hover:translate-x-1 transition-all duration-200 text-slate-400"
                >
                  News & Blog
                </Link>
                <Link
                  to="/about"
                  className="hover:text-cyan-400 transform hover:translate-x-1 transition-all duration-200 text-slate-400"
                >
                  Contact Support
                </Link>
              </div>
            </div>

            {/* Support Links Column */}
            <div className="flex flex-col space-y-3.5">
              <h4 className="font-bold text-white tracking-wider text-[11px] uppercase opacity-90">
                Support
              </h4>
              <div className="flex flex-col space-y-2.5 text-xs">
                <Link
                  to="/completepayment"
                  className="hover:text-cyan-400 transform hover:translate-x-1 transition-all duration-200 text-slate-400"
                >
                  Secure Payment
                </Link>
                <a
                  href="#"
                  className="hover:text-cyan-400 transform hover:translate-x-1 transition-all duration-200 text-slate-400"
                >
                  Delivery Timings
                </a>
                <a
                  href="#"
                  className="hover:text-cyan-400 transform hover:translate-x-1 transition-all duration-200 text-slate-400"
                >
                  Easy Returns
                </a>
                <Link
                  to="/faq"
                  className="hover:text-cyan-400 transform hover:translate-x-1 transition-all duration-200 text-slate-400"
                >
                  Help & FAQ
                </Link>
              </div>
            </div>

            {/* Programs Links Column
            <div className="flex flex-col space-y-3.5">
              <h4 className="font-bold text-white tracking-wider text-[11px] uppercase opacity-90">
                Programs
              </h4>
              <div className="flex flex-col space-y-2.5 text-xs">
                <a
                  href="#"
                  className="hover:text-cyan-400 transform hover:translate-x-1 transition-all duration-200 text-slate-400"
                >
                  Weekly Offers
                </a>
                <a
                  href="#"
                  className="hover:text-cyan-400 transform hover:translate-x-1 transition-all duration-200 text-slate-400"
                >
                  Gift Cards
                </a>
                <a
                  href="#"
                  className="hover:text-cyan-400 transform hover:translate-x-1 transition-all duration-200 text-slate-400"
                >
                  Vouchers
                </a>
                <a
                  href="#"
                  className="hover:text-cyan-400 transform hover:translate-x-1 transition-all duration-200 text-slate-400"
                >
                  Careers
                </a>
              </div>
            </div> */}
          </div>

          {/* Bottom Copyright Information Section */}
          <div className="border-t border-slate-200/5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© 2026 ListKaro. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-slate-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-slate-400 transition-colors">
                Cookie Controls
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
