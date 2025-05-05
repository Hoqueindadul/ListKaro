import React, { useState, useEffect } from "react";
import axios from 'axios';

import "./Home.css";
import './HomeDark.css';
import './HomeSmall.css';

function Home() {
    // const [showPopup, setShowPopup] = useState(false); 
    const [offerPopup, setofferPopup] = useState(false);
    const [offerPopupClose, setofferPopupClose] = useState(false);
    const [copied, setCopied] = useState(false);
    const [email, setEmail] = useState("");
    // const [LightMode, setLightMode] = useState(true); 

    useEffect(() => {
        const waiting = 15000;
        setTimeout(() => {
            if (!offerPopupClose) {
                setofferPopup(true);
            }
        }, waiting);

    }, [offerPopupClose]);

    const closeOfferPopup = () => {
        setofferPopup(false);
        setofferPopupClose(true);
    };

    const copytext = () => {
        navigator.clipboard.writeText('J&M')
            .then(() => {
                setCopied(true);
                setTimeout(() => {
                    setCopied(false);
                }, 15000);
            })
    }

    const handleEmailSubmission = async (e) => {
        e.preventDefault();

        if (!email) {
            alert("Please enter a valid email address.");
            return;
        }

        try {
            const res = await axios.post("http://localhost:5000/api/subscribe", { email });
            alert(res.data.message);
            setEmail("");
        } catch (err) {
            alert(err.response?.data?.message || "Failed! Something went wrong.");
        }
    };


    const [LightMode, setLightMode] = useState(true);

    const OnDarkMode = () => {
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
        }
        else {
            setLightMode(true);
            document.body.classList.remove('dark');
        }
    }, []);

    return (
        <>
            {
                offerPopup && (
                    <div>
                        <div className="offerPopupContainer">

                            <div className="offerPopupContent">
                                <p onClick={closeOfferPopup} style={{ position: 'absolute', right: '15px', cursor: 'pointer', fontWeight: 'bold' }}>X</p>
                                <h3>GET UPTO 50% OFF</h3>
                                <p>Get Exciting offers! Starting from Rs 199/- Use Code <i>J&M</i> and enjoy 50% off upto Rs 250/-</p>
                                <button onClick={copytext} className="ccbtn"> {copied ? <i> Copied </i> : 'Copy Code'}</button>
                            </div>
                        </div>
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
                        <img src="/images/c1.jpg" alt="" id="slide1" />
                        <img src="/images/c2.jpg" alt="" id="slide2" />
                        <img src="/images/c3.jpg" alt="" id="slide3" />

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
                            Tasty Bites, Anytime! <br />
                            Explore our wide range of snacks – from crispy chips to healthy munchies. <br />
                            Perfect for your cravings, anytime, anywhere! <br /> <br />
                            <strong style={{ fontSize: '16px' }}>Get 20% off: Use Code "<em>IamHungry</em>" </strong> <br /> <br />
                        </p>
                        <a href="#" className="card-button">Buy Now</a>
                    </div>
                </div>

                <div className="card-container">
                    <img src="/images/groceries.jpg" className="card-image" alt="groceries" />
                    <div className="card-body">
                        <h5 className="card-title">Groceries</h5>
                        <p className="card-text">
                            Daily Essentials, Delivered Fresh! <br />
                            From farm-fresh vegetables to pantry staples – get everything you need in one place. <br />
                            Quality you trust, prices you'll love! <br /> <br />
                            <strong style={{ fontSize: '16px' }}>Get 10% off: use code "<em>FreshStart</em>" </strong> <br /> <br />
                        </p>
                        <a href="#" className="card-button">Buy Now</a>
                    </div>
                </div>
            </section>
            <hr />

            <h3 className="categoriestitle">Categories     <hr /> </h3>

            <section className="categories">

                <div className="circontainer">
                    <img src="/images/fruits.jpg" alt="" className="cirimage" />
                    <p>Fruits</p>
                </div>

                <div className="circontainer">
                    <img src="/images/vege.jpg" alt="" className="cirimage" />
                    <p>Vegetables</p>
                </div>

                <div className="circontainer">
                    <img src="/images/c3.jpg" alt="" className="cirimage" />
                    <p>Dairy Products</p>
                </div>

                <div className="circontainer">
                    <img src="/images/meat.jpg" alt="" className="cirimage" />
                    <p>Meat </p>
                </div>

                <div className="circontainer">
                    <img src="/images/snacks.jpg" alt="" className="cirimage" />
                    <p>Snacks </p>
                </div>

                <div className="circontainer">
                    <img src="/images/drink.jpg" alt="" className="cirimage" />
                    <p>Drinks</p>
                </div>


            </section>

            <section className="categories">

                <div className="circontainer">
                    <img src="/images/frozen.jpg" alt="" className="cirimage" />
                    <p>Frozen Foods</p>
                </div>

                <div className="circontainer">
                    <img src="/images/sweet.jpg" alt="" className="cirimage" />
                    <p>Sweets & Desserts</p>
                </div>

                <div className="circontainer">
                    <img src="/images/canned.jpg" alt="" className="cirimage" />
                    <p>Canned Foods</p>
                </div>

                <div className="circontainer">
                    <img src="/images/cake.jpg" alt="" className="cirimage" />
                    <p>Cakes and Breads</p>
                </div>

                <div className="circontainer">
                    <img src="/images/rice.jpg" alt="" className="cirimage" />
                    <p>Rice</p>
                </div>

                <div className="circontainer">
                    <img src="/images/biscuit.jpg" alt="" className="cirimage" />
                    <p>Biscuits</p>
                </div>


            </section>

            <hr />

            <section className="offer">
                <div className="offerimage">
                    <img src="/images/juice.png" alt="" className="offerimg" />
                </div>
                <div className="offercontainer">
                    <h3>GET REFRESHED THIS SUMMER! ☀️</h3>
                    <p>Buy 2 bottle of Orange juice and get one orange juice for Free</p>
                    <p id="star">*Terms and Conditions applicable</p>
                    <p id="price">Price : <del>99/-</del> Now only : 79/-</p>
                    <a href="" > <input type="button" value={'Buy Now'} /> </a>
                </div>


            </section>

            <hr />

            <section className="newsletter">
                <form className="newsletterhead" onSubmit={handleEmailSubmission}>
                    <h3>Get top deals, latest trends, and more.</h3>
                    <p>Join our email subscription now to get updates on promotions and coupons.</p>
                    <input type="email" placeholder="Enter email address" className="emailbox" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input type="submit" value={'Join now'} className="emailbtn" />
                </form>
                <img src={LightMode ? '/images/newsletterday.png' : '/images/newsletternight.png'} alt="" height={'400px'} width={'300px'} />
            </section>

            <hr />

            <footer>
                <div className="products">
                    <p>Caterogies</p>
                    <a href="">Dairy Products</a>
                    <a href="">Fruits</a>
                    <a href="">Vegies</a>
                    <a href="">Canned Products</a>
                    <a href="">Sweets</a>
                    <a href="">Snacks</a>
                    <a href="">Cookies</a>
                    <a href="">Cakes</a>

                </div>

                <div className="aboutus">
                    <p>About us</p>
                    <a href="/about">Company</a>
                    <a href="/about">Developers</a>
                    <a href="/about">Blog</a>
                    <a href="/about">Contact</a>
                </div>
                <div className="consumers">
                    <p>Customers</p>
                    <a href="/completepayment">Payment</a>
                    <a href="">Delivery</a>
                    <a href="">Return </a>
                    <a href="/faq">FAQ</a>
                </div>
                <div className="programs">
                    <p>Programs</p>
                    <a href="">Offers</a>
                    <a href="">Gift Cards</a>
                    <a href="">Vouchars </a>
                    <a href="">Career</a>
                </div>
            </footer>
            <hr />
        </>
    );
}

export default Home;


