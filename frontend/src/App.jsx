import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'

import SideBar from "./pages/Sidebar";
import Home from './pages/Home'
import UpList from "./pages/UpList";


function App() {
  
  return (
    <>
    <Router>
      <Routes>
          <Route path="/" element={<SideBar />}>
          <Route index element={<Home />} />
          <Route path="/uploadlist" element={<UpList />} />
        </Route>
      </Routes>
    </Router>
    </>
  )
}

export default App
