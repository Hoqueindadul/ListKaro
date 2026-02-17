import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import toast, { Toaster } from 'react-hot-toast';
import './App.css'
import useAutoLogout from "./store/useAutoLogout";
import { useAuthStore } from "./store/authStore";

import Home from './pages/Home/Home'
import UpList from "./pages/ListUpload/UpList";
import Profile from "./pages/Common/Profile"
import About from "./pages/AboutUs/About";
import PaymentForm from './pages/Payment/PaymentForm'
import FAQ from './pages/FAQ/FAQ'
import EmailVerificationPage from "./pages/EmailPassword/EmailVerificationPage";
import LoginPage from "./pages/Auth/LoginPage"
import Signup from "./pages/Auth/Signup";
import ForgotPasswordPage from "./pages/EmailPassword/ForgotPasswordPage"
import ResetPasswordPage from "./pages/EmailPassword/ResetPasswordPage";
import Dashboard from "./adminpanel/Dashboard";
import ShoppingCart from "./pages/Cart/ShoppingCart";
import OrderPage from "./pages/Order/OrderPage";
import Placed from "./pages/Order/Placed";
import Navbar from "./pages/Common/Navbar";
import Products from "./pages/Product/Products"
import ProductDetails from "./pages/Product/ProductDetails";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  // Get token from localStorage (or your AuthContext if you have one)
  const token = localStorage.getItem("token");

  // Define your logout function
  const handleAutoLogout = async () => {
    await logout();
    toast.error("Session expired. Please login again.");
    navigate("/login");
  };
  // auto logout
  useAutoLogout(token, handleAutoLogout, 2 * 24 * 60 * 60 * 1000); // 2 days inactivity timeout

  // Define routes where Navbar should be hidden
  const hideNavbarRoutes = ["/adminpanel"];

  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}

      <div className={!shouldHideNavbar ? "pt-6" : ""} style={!shouldHideNavbar ? { paddingTop: "0px" } : {}}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/uploadlist" element={<UpList />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/completepayment" element={<PaymentForm />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/emailVerification" element={<EmailVerificationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/adminpanel" element={<Dashboard />} />
          <Route path="/shopping-cart" element={<ShoppingCart />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/orderplaced" element={<Placed />} />
        </Routes>
        <Toaster
          position="top-center"
          reverseOrder={false}
        />


      </div>

    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

