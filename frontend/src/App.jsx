import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import "./App.css";
import useAutoLogout from "./store/useAutoLogout";
import { useAuthStore } from "./store/authStore";

// Static imports for core layout
import Navbar from "./pages/Common/Navbar";

// Lazy-loaded components for performance optimization
const Home = React.lazy(() => import("./pages/Home/Home"));
const UpList = React.lazy(() => import("./pages/ListUpload/UpList"));
const Profile = React.lazy(() => import("./pages/Common/Profile"));
const About = React.lazy(() => import("./pages/AboutUs/About"));
const PaymentForm = React.lazy(() => import("./pages/Payment/PaymentForm"));
const FAQ = React.lazy(() => import("./pages/FAQ/FAQ"));
const EmailVerificationPage = React.lazy(
  () => import("./pages/EmailPassword/EmailVerificationPage"),
);
const LoginPage = React.lazy(() => import("./pages/Auth/LoginPage"));
const Signup = React.lazy(() => import("./pages/Auth/Signup"));
const ForgotPasswordPage = React.lazy(
  () => import("./pages/EmailPassword/ForgotPasswordPage"),
);
const ResetPasswordPage = React.lazy(
  () => import("./pages/EmailPassword/ResetPasswordPage"),
);
const Dashboard = React.lazy(() => import("./adminpanel/Dashboard"));
const ShoppingCart = React.lazy(() => import("./pages/Cart/ShoppingCart"));
const OrderPage = React.lazy(() => import("./pages/Order/OrderPage"));
const Placed = React.lazy(() => import("./pages/Order/Placed"));
const OrderListing = React.lazy(() => import("./pages/Order/OrdersListing"));
const TrackShipment = React.lazy(() => import("./pages/Order/TrackShipment"));
const Products = React.lazy(() => import("./pages/Product/Products"));
const ProductDetails = React.lazy(
  () => import("./pages/Product/ProductDetails"),
);

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary-200 dark:border-primary-900 border-t-primary-600 dark:border-t-primary-500 rounded-full animate-spin"></div>
      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
        Loading ListKaro...
      </p>
    </div>
  </div>
);

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const token = localStorage.getItem("token");

  const handleAutoLogout = async () => {
    await logout();
    toast.error("Session expired. Please login again.");
    navigate("/login");
  };

  useAutoLogout(token, handleAutoLogout, 2 * 24 * 60 * 60 * 1000);

  const hideNavbarRoutes = ["/adminpanel"];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}

      <div>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/uploadlist" element={<UpList />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<About />} />
            <Route path="/completepayment" element={<PaymentForm />} />
            <Route path="/faq" element={<FAQ />} />
            <Route
              path="/emailVerification"
              element={<EmailVerificationPage />}
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/reset-password/:token"
              element={<ResetPasswordPage />}
            />
            <Route path="/adminpanel" element={<Dashboard />} />
            <Route path="/shopping-cart" element={<ShoppingCart />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/order" element={<OrderPage />} />
            <Route path="/orderplaced" element={<Placed />} />
            <Route path="/orderlisting" element={<OrderListing />} />
            <Route path="/track-shipment" element={<TrackShipment />} />
          </Routes>
        </Suspense>

        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            className: "dark:bg-gray-800 dark:text-white",
            style: {
              borderRadius: "10px",
              padding: "16px",
            },
          }}
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
