import React from "react";
import "./Home.css";

function Home() {
  const [showPopup, setShowPopup] = React.useState(false);

  return (
    <> 
    <nav className="navbar my-navbar ">
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
            />
        </div>

        </div>


        <div className="offcanvas offcanvas-end custom-sidebar" tabIndex="-1" id="sidebarMenu" aria-labelledby="sidebarTitle">
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="sidebarTitle">Menu</h5>
            <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>

          <div className="offcanvas-body">
            <ul className="navbar-nav">
              <li className="nav-item"><a className="nav-link" href="#">Home</a></li>
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
              <li className="nav-item"><a className="nav-link" href="https://your-about-page.com" target="_blank" rel="noopener noreferrer">About</a></li>
              <li className="nav-item"><a className="nav-link" href="/profile">Profile</a></li></ul>
          </div>
        </div>
      </div>
    </nav>

    {     
    
    showPopup && (
      <div className="signupcontainer">
          <div className="signheader">
            <h3>Sign Up</h3>
            <span onClick={ ()=> setShowPopup(false)}> Close </span>
          </div>

          <form action="" method="post">
          <input type="text" placeholder="Enter your name " required/>
          <input type="email" placeholder="Enter you email"  required />
          <input type="password" placeholder="Set a password" required />
          <input type="number" placeholder="Phone Number (Optional)" />
          <input class="form-check-input" type="checkbox" value="" id="checkDefault"/>  Agree to the terms and conditions
          <input type="submit" value={"Signup"} />
          </form>
      </div>
    )
    
    }


<div className="offer-banner">
  <div className="offer-text">
    <span>🚚 Get Your Order Delivered in Just 45 Minutes!</span>
    <span>📝 Upload Your Grocery List & Buy Everything at Once</span>
    <span>📦 Free Delivery on Orders Above ₹499</span>
    <span>🧀 Exclusive Discounts on All Dairy Products!</span>
  </div>
</div>

    <section className="carocontainer">

      <div className="slide-wrapper">
        <div className="slider">
          <img src="../../public/images/c1.jpg" alt="" id="slide1" />
          <img src="../../public/images/c2.jpg" alt="" id="slide2" />
          <img src="../../public/images/c3.jpg" alt="" id="slide3" />

          <div className="slider-nav">
          <a href="#slide1"></a>
          <a href="#slide2"></a>
          <a href="#slide3"></a>
          </div>
        </div>
      </div>

      <div className="card-container">
        <img src="/images/snacks.jpg" className="card-image" alt="groceries" />
        <div className="card-body">
          <h5 className="card-title">Snacks</h5>
          <p className="card-text">
            Ekhane Likhe dis kichu
          </p>
          <a href="#" className="card-button">Buy Now</a>
        </div>
      </div>

      <div className="card-container">
        <img src="/images/groceries.jpg" className="card-image" alt="groceries" />
        <div className="card-body">
          <h5 className="card-title">Groceries</h5>
          <p className="card-text">
          Ekhane Likhe dis kichu
          </p>
          <a href="#" className="card-button">Buy Now</a>
        </div>
      </div>



    </section>
    <hr/>

    </>
  );
}

export default Home;


