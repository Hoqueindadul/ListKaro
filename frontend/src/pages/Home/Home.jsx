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

import "./Home.css";
import "./HomeDark.css";
import "./HomeSmall.css";

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

  const [LightMode, setLightMode] = useState(true);
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
      {/* ========== OFFER POPUP ========== */}
      {offerPopup && (
        <div className="home-offer-popup-overlay" onClick={closeOfferPopup}>
          <div
            className="home-offer-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="home-offer-popup-close"
              onClick={closeOfferPopup}
            >
              ✕
            </button>
            <div className="home-offer-popup-badge">
              <Gift size={18} /> Limited Time
            </div>
            <h3 className="home-offer-popup-title">GET UP TO 50% OFF</h3>
            <p className="home-offer-popup-desc">
              Starting from ₹199/- Use Code <strong>J&M</strong> and enjoy 50%
              off up to ₹250/-
            </p>
            <button onClick={copyText} className="home-offer-popup-btn">
              {copied ? "✓ Copied!" : "Copy Code"}
            </button>
          </div>
        </div>
      )}

      {/* ========== ANNOUNCEMENT BAR ==========
            <div className="home-announcement-bar">
                <div className="home-announcement-track">
                    <span><Truck size={14} /> Get Your Order Delivered in Just 45 Minutes!</span>
                    <span><Upload size={14} /> Upload Your Grocery List & Buy Everything at Once</span>
                    <span><Gift size={14} /> Free Delivery on Orders Above ₹499</span>
                    <span><Sparkles size={14} /> Exclusive Discounts on All Dairy Products!</span>
                    <span><Truck size={14} /> Get Your Order Delivered in Just 45 Minutes!</span>
                    <span><Upload size={14} /> Upload Your Grocery List & Buy Everything at Once</span>
                    <span><Gift size={14} /> Free Delivery on Orders Above ₹499</span>
                    <span><Sparkles size={14} /> Exclusive Discounts on All Dairy Products!</span>
                </div>
            </div> */}

      {/* ========== HERO SECTION ========== */}
      <section className="home-hero" id="home-hero">
        <div className="home-hero-slides">
          {HERO_SLIDES.map((slide, idx) => (
            <div
              key={idx}
              className={`home-hero-slide ${idx === currentSlide ? "active" : ""}`}
            >
              <img
                src={slide.img}
                alt={slide.title}
                className="home-hero-slide-img"
              />
              <div className="home-hero-slide-overlay" />
              <div className="home-hero-slide-content">
                <h1 className="home-hero-title">{slide.title}</h1>
                <p className="home-hero-subtitle">{slide.subtitle}</p>
                <Link to={slide.link} className="home-hero-cta">
                  {slide.cta} <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <button
          className="home-hero-nav home-hero-nav-prev"
          onClick={prevSlide}
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          className="home-hero-nav home-hero-nav-next"
          onClick={nextSlide}
          aria-label="Next slide"
        >
          <ChevronRight size={24} />
        </button>

        <div className="home-hero-dots">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              className={`home-hero-dot ${idx === currentSlide ? "active" : ""}`}
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ========== FEATURES BAR ========== */}
      <section className="home-features">
        <div className="home-features-inner">
          <div className="home-feature-item">
            <div className="home-feature-icon">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="home-feature-title">45 Min Delivery</h4>
              <p className="home-feature-desc">Lightning fast to your door</p>
            </div>
          </div>
          <div className="home-feature-item">
            <div className="home-feature-icon">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="home-feature-title">100% Fresh</h4>
              <p className="home-feature-desc">Quality guaranteed always</p>
            </div>
          </div>
          <div className="home-feature-item">
            <div className="home-feature-icon">
              <Clock size={24} />
            </div>
            <div>
              <h4 className="home-feature-title">Easy Returns</h4>
              <p className="home-feature-desc">No questions asked</p>
            </div>
          </div>
          <div className="home-feature-item">
            <div className="home-feature-icon">
              <Zap size={24} />
            </div>
            <div>
              <h4 className="home-feature-title">Best Prices</h4>
              <p className="home-feature-desc">Save more every day</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CATEGORIES ========== */}
      <section className="home-categories-section">
        <div className="home-section-header">
          <div>
            <h2 className="home-section-title">Shop by Category</h2>
            <p className="home-section-subtitle">
              Browse through our wide range of products
            </p>
          </div>
          <div className="home-category-nav-btns">
            <button
              onClick={() => scrollCategories("left")}
              className="home-cat-scroll-btn"
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scrollCategories("right")}
              className="home-cat-scroll-btn"
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <div className="home-categories-scroll" ref={categoryScrollRef}>
          {CATEGORIES.map((cat, idx) => (
            <Link to={cat.link} key={idx} className="home-category-card">
              <div className="home-category-img-wrap">
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="home-category-img"
                />
              </div>
              <span className="home-category-name">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ========== PROMO CARDS ========== */}
      <section className="home-promo-section">
        <div className="home-promo-grid">
          <div className="home-promo-card home-promo-card-snacks">
            <div className="home-promo-card-img-wrap">
              <img
                src="/images/snacks.jpg"
                alt="Snacks"
                className="home-promo-card-img"
              />
            </div>
            <div className="home-promo-card-content">
              <span className="home-promo-badge">🔥 Trending</span>
              <h3 className="home-promo-card-title">Snacks & Munchies</h3>
              <p className="home-promo-card-text">
                Explore our wide range of snacks – from crispy chips to healthy
                munchies. Perfect for your cravings!
              </p>
              <div className="home-promo-coupon">
                <span>
                  Use Code: <strong>IamHungry</strong>
                </span>
                <span className="home-promo-discount">20% OFF</span>
              </div>
              <Link to="/products" className="home-promo-card-btn">
                Shop Now <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="home-promo-card home-promo-card-grocery">
            <div className="home-promo-card-img-wrap">
              <img
                src="/images/groceries.jpg"
                alt="Groceries"
                className="home-promo-card-img"
              />
            </div>
            <div className="home-promo-card-content">
              <span className="home-promo-badge home-promo-badge-green">
                🌿 Fresh
              </span>
              <h3 className="home-promo-card-title">Daily Essentials</h3>
              <p className="home-promo-card-text">
                From farm-fresh vegetables to pantry staples – get everything
                you need in one place.
              </p>
              <div className="home-promo-coupon">
                <span>
                  Use Code: <strong>FreshStart</strong>
                </span>
                <span className="home-promo-discount home-promo-discount-green">
                  10% OFF
                </span>
              </div>
              <Link
                to="/products"
                className="home-promo-card-btn home-promo-card-btn-green"
              >
                Shop Now <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== DEAL OF THE DAY ========== */}
      <section className="home-deal-section">
        <div className="home-deal-inner">
          <div className="home-deal-image-wrap">
            <img
              src="/images/juice.png"
              alt="Summer Offer"
              className="home-deal-image"
            />
            <div className="home-deal-badge-circle">
              <span className="home-deal-badge-off">20%</span>
              <span className="home-deal-badge-text">OFF</span>
            </div>
          </div>
          <div className="home-deal-content">
            <span className="home-deal-tag">
              <Star size={14} /> Deal of the Day
            </span>
            <h2 className="home-deal-title">GET REFRESHED THIS SUMMER! ☀️</h2>
            <p className="home-deal-desc">
              Buy 2 bottles of Orange Juice and get one absolutely Free!
            </p>
            <div className="home-deal-price-row">
              <span className="home-deal-price-old">₹99</span>
              <span className="home-deal-price-new">₹79</span>
              <span className="home-deal-save-badge">Save ₹20</span>
            </div>
            <p className="home-deal-terms">*Terms and Conditions applicable</p>
            <Link to="/products" className="home-deal-btn">
              Grab This Deal <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ========== ONE CLICK SHOPPING ========== */}
      <section className="home-upload-section">
        <div className="home-upload-inner">
          <div className="home-upload-content">
            <span className="home-upload-tag">
              <Zap size={14} /> Smart Feature
            </span>
            <h2 className="home-upload-title">One Click Shopping</h2>
            <p className="home-upload-desc">
              Upload your grocery list and we'll prepare everything for you. No
              more browsing through hundreds of products – just upload and
              checkout!
            </p>
            <div className="home-upload-steps">
              <div className="home-upload-step">
                <div className="home-upload-step-num">1</div>
                <span>Upload your list</span>
              </div>
              <div className="home-upload-step">
                <div className="home-upload-step-num">2</div>
                <span>We prepare it</span>
              </div>
              <div className="home-upload-step">
                <div className="home-upload-step-num">3</div>
                <span>Delivered to you</span>
              </div>
            </div>
            <Link to="/uploadlist" className="home-upload-btn">
              <Upload size={18} /> Upload Your List
            </Link>
          </div>
          <div className="home-upload-visual">
            <img
              src="/images/shopping.jpg"
              alt="One Click Shopping"
              className="home-upload-img"
            />
          </div>
        </div>
      </section>

      {/* ========== NEWSLETTER ========== */}
      <section className="home-newsletter-section">
        <div className="home-newsletter-inner">
          <div className="home-newsletter-content">
            <h2 className="home-newsletter-title">
              Get Top Deals, Latest Trends & More
            </h2>
            <p className="home-newsletter-desc">
              Join our email subscription now to get updates on promotions,
              coupons, and exclusive offers.
            </p>
            <form
              className="home-newsletter-form"
              onSubmit={handleEmailSubmission}
            >
              <input
                type="email"
                placeholder="Enter your email address"
                className="home-newsletter-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="home-newsletter-btn">
                Subscribe
              </button>
            </form>
            <p className="home-newsletter-note">
              🔒 We respect your privacy. Unsubscribe anytime.
            </p>
          </div>
          <div className="home-newsletter-visual">
            <img
              src={
                LightMode
                  ? "/images/newsletterday.png"
                  : "/images/newsletternight.png"
              }
              alt="Newsletter"
              className="home-newsletter-img"
            />
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="home-footer-brand">
            <div className="home-footer-logo-row">
              <img
                src="/images/logo.png"
                alt="ListKaro"
                className="home-footer-logo"
              />
              <span className="home-footer-brand-name">ListKaro</span>
            </div>
            <p className="home-footer-tagline">
              Your one-stop shop for fresh groceries, delivered to your doorstep
              in 45 minutes.
            </p>
          </div>
          <div className="home-footer-col">
            <h4 className="home-footer-col-title">Categories</h4>
            <Link to="/dairy-products">Dairy Products</Link>
            <Link to="/Fruits">Fruits</Link>
            <Link to="/vegetables">Vegetables</Link>
            <Link to="/canned-products">Canned Products</Link>
            <Link to="/snacks">Snacks</Link>
          </div>
          <div className="home-footer-col">
            <h4 className="home-footer-col-title">About Us</h4>
            <Link to="/about">Company</Link>
            <Link to="/about">Developers</Link>
            <Link to="/about">Blog</Link>
            <Link to="/about">Contact</Link>
          </div>
          <div className="home-footer-col">
            <h4 className="home-footer-col-title">Customer Support</h4>
            <Link to="/completepayment">Payment</Link>
            <a href="#">Delivery</a>
            <a href="#">Returns</a>
            <Link to="/faq">FAQ</Link>
          </div>
          <div className="home-footer-col">
            <h4 className="home-footer-col-title">Programs</h4>
            <a href="#">Offers</a>
            <a href="#">Gift Cards</a>
            <a href="#">Vouchers</a>
            <a href="#">Careers</a>
          </div>
        </div>
        <div className="home-footer-bottom">
          <p>© 2026 ListKaro. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

export default Home;
