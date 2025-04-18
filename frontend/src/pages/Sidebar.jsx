import { Outlet } from "react-router-dom";
import "./Home.css"; // Keep your existing CSS

function SideBar() {
  return (
    <div className="container">

      <div className="left">
        <div className="logo_container">
          <div className="login"></div>
        </div>

        <div className="navbar">
          <ul>
            <a href="/"> <li>Home</li> </a>
            <a href="/products"> <li>Products</li> </a>
            <a href="/about"> <li>About</li> </a>
            <a href="uploadlist"> <li>Upload List</li> </a>
          </ul>
        </div>
      </div>


      <div className="right">
        <Outlet />
      </div>
    </div>
  );
}

export default SideBar;
