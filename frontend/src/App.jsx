import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'

import Home from './pages/Home'
import UpList from "./pages/UpList";
import Profile from "./pages/Profile"
import About from "./pages/About";
import PaymentForm from './pages/PaymentForm'
import FAQ from './pages/FAQ'
import EmailVerificationPage from "./pages/EmailVerificationPage";
import LoginPage from "./pages/LoginPage"
import ForgotPasswordPage from "./pages/ForgotPasswordPage"
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Dashboard from "./adminpanel/Dashboard";
import ShoppingCart from "./pages/ShoppingCart";
import OrderPage from "./pages/OrderPage";
import Placed from "./pages/Placed";
import Navbar from "./pages/Navbar";
import Products from "./pages/Products"

function AppContent() {
  const location = useLocation();

  // Define routes where Navbar should be hidden
  const hideNavbarRoutes = ["/adminpanel"];

  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}

      <div className={!shouldHideNavbar ? "pt-6" : ""} style={!shouldHideNavbar ? { paddingTop: "100px" } : {}}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/uploadlist" element={<UpList />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/completepayment" element={<PaymentForm />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/emailVerification" element={<EmailVerificationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/adminpanel" element={<Dashboard />} />
          <Route path="/shopping-cart" element={<ShoppingCart />} />
          <Route path="/products" element={<Products />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/orderplaced" element={<Placed />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
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

