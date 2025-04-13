import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

import './App.css'

import Home from './pages/Home'
import UpList from "./pages/UpList";
import Profile from "./pages/Profile"
import About from "./pages/About";


function App() {
  
  return (
    <>
    <Router>
      <Routes>

          <Route index element={<Home />} />
          <Route path="/uploadlist" element={ <UpList />} />
          <Route path="/profile" element={ <Profile/> } />
          <Route path="/about" element={ <About/> } />

      </Routes>
    </Router>
    </>
  )
}

export default App
