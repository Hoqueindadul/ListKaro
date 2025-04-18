<<<<<<< HEAD:frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

import './App.css'

import Home from './pages/Home'
import UpList from "./pages/UpList";
import Profile from "./pages/Profile"
<<<<<<< HEAD


=======
import About from "./pages/About";
import PaymentForm from './pages/PaymentForm'
import FAQ from './pages/FAQ'
>>>>>>> dde4edb5a9e409e6d9b6f0d3963bca7200dd1176
function App() {
  
  return (
    <>
    <Router>
      <Routes>

          <Route index element={<Home />} />
          <Route path="/uploadlist" element={ <UpList />} />
          <Route path="/profile" element={ <Profile/> } />
<<<<<<< HEAD
=======
          <Route path="/about" element={ <About/> } />
          <Route path="/completepayment" element={ <PaymentForm/> } />
          <Route path="/faq" element={ <FAQ/> } />


>>>>>>> dde4edb5a9e409e6d9b6f0d3963bca7200dd1176

      </Routes>
    </Router>
    </>
  )
}

export default App
=======
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

import './App.css'

import Home from './pages/Home'
import UpList from "./pages/UpList";
import Profile from "./pages/Profile"


function App() {
  
  return (
    <>
    <Router>
      <Routes>

          <Route index element={<Home />} />
          <Route path="/uploadlist" element={ <UpList />} />
          <Route path="/profile" element={ <Profile/> } />

      </Routes>
    </Router>
    </>
  )
}

export default App
>>>>>>> 60f21a9 (working on product serach from image list):src/App.jsx
