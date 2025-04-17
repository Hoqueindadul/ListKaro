import React, { useState , useEffect} from "react";
import SignUp from "./Signup";

export default function Navbar(){
        const [showPopup, setShowPopup] = useState(false); 
        const [LightMode, setLightMode] = useState(true);

        const OnDarkMode = () =>{
            const DarkMode = !LightMode;
            setLightMode(DarkMode);
            document.body.classList.toggle('dark');
            localStorage.setItem('theme', DarkMode ? 'light' : 'dark');
          }
        useEffect(() => {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
              setLightMode(false);
              document.body.classList.add('dark');
            } else {
              setLightMode(true);
              document.body.classList.remove('dark');
            }
          }, []);

        const handleRegistration = () => {

        }

    return(
        <>
                <nav className="navbar my-navbar">
                    <div className="container d-flex justify-content-between align-items-center">

                        <div className="d-flex align-items-center">
                        <img src="/images/logo.png" alt="logo" className="logo" />
                        <a className="navbar-brand my-brand ms-2" href="#">ListKaro</a>
                        
                        </div>

                        <div className="d-flex align-items-center">
                        <input type="search"  placeholder="Search for items" className="searchbar"/>


                        <li style={{ display: 'inline-block', fontSize: '20px', }}>
                        <a href="/uploadlist" style={{ textDecoration: 'none', color: 'white', fontWeight: 'bold' }}>Upload List</a>
                        <img src="../../public/images/uploadIcon.gif" alt="Upload Icon" style={{ width: '20px', height: '20px',marginLeft: '10px', marginRight: '20px', verticalAlign: 'middle' }}/>  
                        </li>


                        <button className="navbar-toggler ms-auto" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebarMenu" aria-controls="sidebarMenu" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                        </button>

                        <div onClick={() => setShowPopup(true)} style={{ cursor: 'pointer' }}>
                            <img
                            src="/images/user.png"
                            height="25px"
                            width="25px"
                            style={{ marginLeft: "20px", marginRight: "20px" }}
                            alt="User"
                            className="profileicon"
                            />
                        </div>

                        <img src={LightMode? '/images/sun.png' : '/images/moon.png'} onClick={OnDarkMode} alt="Image" className="sunmoonicon" />
                        
                        </div>


                        <div className="offcanvas offcanvas-end custom-sidebar" tabIndex="-1" id="sidebarMenu" aria-labelledby="sidebarTitle">
                        <div className="offcanvas-header">
                            <h5 className="offcanvas-title" id="sidebarTitle">Menu</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                        </div>

                        <div className="offcanvas-body">
                            <ul className="navbar-nav">
                            <li className="nav-item"><a className="nav-link" href="/">Home</a></li>
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">Products</a>
                                <ul className="dropdown-menu">
                                <li><a className="dropdown-item" href="#">Dairy</a></li>
                                <li><a className="dropdown-item" href="#">Packed</a></li>
                                <li><a className="dropdown-item" href="#">Veggies & Fruits</a></li>
                                <li><a className="dropdown-item" href="#">Sweets</a></li>
                                </ul>
                            </li>
                            <li className="nav-item"><a className="nav-link" href="/uploadlist">Upload List</a></li>
                            <li className="nav-item"><a className="nav-link" href="/about" target="_blank" rel="noopener noreferrer">About</a></li>
                            <li className="nav-item"><a className="nav-link" href="/profile">Profile</a></li></ul>
                        </div>
                        </div>
                    </div>
                </nav>

                <SignUp showPopup={showPopup} setShowPopup={setShowPopup} />

                
        </>
    )
}