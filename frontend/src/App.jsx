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
import Dashboard from "./adminpanel/Dashboard";
import Products from "./pages/Products";
import OrderPage from "./pages/OrderPage";
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
          <Route path="/adminpanel" element={ <Dashboard/> } />
          <Route path="/products" element={ <Products/> } />
          <Route path='/orderpage' element={<OrderPage />}> </Route>


      </Routes>
    </Router>
    </>
  )
}

export default App
