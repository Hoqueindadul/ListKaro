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
function App() {
  
  return (
    <>
    <Router>
      <Routes>

          <Route index element={<Home />} />
          <Route path="/uploadlist" element={ <UpList />} />
          <Route path="/profile" element={ <Profile/> } />
          <Route path="/about" element={ <About/> } />
          <Route path="/completepayment" element={ <PaymentForm/> } />
          <Route path="/faq" element={ <FAQ/> } />



      </Routes>
    </Router>
    </>
  )
}

export default App
