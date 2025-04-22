import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

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

function App() {
  
  return (
    <>
    <Router>
      <Routes>

          <Route path="/" element={<Home />} />
          <Route path="/uploadlist" element={ <UpList />} />
          <Route path="/profile" element={ <Profile/> } />
          <Route path="/about" element={ <About/> } />
          <Route path="/completepayment" element={ <PaymentForm/> } />
          <Route path="/faq" element={ <FAQ/> } />
          <Route path="/emailVerification" element={ <EmailVerificationPage/> } />
          <Route path="/login" element={ <LoginPage/> } />
          <Route path="/forgot-password" element={ <ForgotPasswordPage/> } />
          <Route path="/reset-password/:token" element={ <ResetPasswordPage/> } />
          <Route path="/adminpanel" element={ <Dashboard/> } />



      </Routes>
    </Router>
    </>
  )
}

export default App
