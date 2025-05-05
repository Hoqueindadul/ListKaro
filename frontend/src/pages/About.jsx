


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './About.css';
import './AboutDark.css';
import './AboutSmall.css';

function About() {
    const [currContent, setcurrContent] = useState('company');
    const [LightMode, setLightMode] = useState(true);

    const OnDarkMode = () => {
        const isLight = !LightMode;
        setLightMode(isLight);
        document.body.classList.toggle('dark', !isLight);
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    };

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const isLight = savedTheme !== 'dark';
        setLightMode(isLight);
        document.body.classList.toggle('dark', !isLight);
    }, []);

    const content = () => {
        switch (currContent) {
            case 'company':
                return (
                    <>
                        <div className="logocontainer">
                            <img src="/images/logo.png" alt="Logo" />
                            <h1>ListKaro</h1>
                        </div>
                        <hr />
                        <div className="companydetails">
                            <p>
                                <strong>ListKaro</strong> is your one-stop online destination for all your grocery and food essentials.
                                From fresh — <br /> <b>dairy products and pantry staples to canned goods, snacks, chocolates, cakes,</b> and more<br />
                                we bring everything you need right to your doorstep.<br /><br />
                                <ul>
                                    <li>Enjoy <strong>free delivery</strong> on orders above ₹499</li>
                                    <li>Superfast delivery within <strong>45 minutes</strong></li>
                                    <li><strong>Upload Your Grocery List</strong> & Buy Everything at Once</li>
                                    <li>Exclusive <strong>Discounts</strong> on All Dairy Products!</li>
                                </ul><br />
                                What makes ListKaro truly unique is our <strong>smart list upload</strong> feature —
                                customers can simply upload an image or file of their handwritten or typed shopping list,<br />
                                and our AI technology will automatically detect the items and create a cart, ready for checkout in seconds.
                                Say goodbye to manual searches and hello to effortless shopping!<br />
                                We support multiple secure payment methods through trusted partners like <strong>Visa, PhonePe, Paytm, UPI</strong>, and more,
                                making your checkout smooth and reliable.<br />
                                With ListKaro, shopping is not just faster — it's smarter.
                            </p>
                            <img src={LightMode ? '/images/hq.png' : '/images/hqnight.png'} alt="Headquarters" height="600px" width="600px" />
                        </div>
                    </>
                );

            case 'developers':
                return (
                    <>
                        <div className="row g-4 container mx-auto align-items-center">
                            <div className="col-md-6">
                                <div className="details">
                                    <h2>Md Abu Jabed</h2>
                                    <h6>BCA Student</h6>
                                    <p>A BCA graduate from Salar, Murshidabad. I’m passionate about tech, with skills in MERN stack development, Python, and web technologies. I’ve worked on several projects, including an eCommerce site with OCR functionality and a book store called Bibliophilia. Beyond coding, I enjoy music production, drawing, and content creation. I believe in learning continuously, keeping things simple, and creating real-world solutions.</p>
                                </div>
                            </div>
                            <div className="col-md-6 text-center">
                                <img src="/images/jabed.jpg" alt="Md Abu Jabed" className="img-fluid rounded" />
                            </div>
                        </div>
                        <hr />
                        <div className="row g-4 container mx-auto align-items-center flex-md-row-reverse">
                            <div className="col-md-6">
                                <div className="details">
                                    <h2>Indadul Hoque</h2>
                                    <h6>BCA Student</h6>
                                    <p>I am BCA Student from Gobra, Murshidabad. With a strong interest in web development and software engineering. I have hands-on experience in developing full-stack web applications, including a E-commerce Web Application with OCR functionality.Through this project, I gained practical skills in designing user interfaces, managing databases, and implementing core functionalities that enhance user experience. I am passionate about learning new technologies and continuously improving my technical and problem-solving abilities.</p>
                                </div>
                            </div>
                            <div className="col-md-6 text-center">
                                <img src="/images/indadul.png" alt="Indadul Hoque" className="img-fluid rounded" />
                            </div>
                        </div>
                    </>
                );

            case 'project':
                return (
                    <>
                        <h1 className="text-center">ListKaro OCR Project</h1>
                        <hr />
                        <section className="projectcontainer container text-center">
                            <p>
                                The <strong>ListKaro</strong> project is an innovative eCommerce platform that uses Optical Character Recognition (OCR) technology
                                to convert handwritten or printed grocery lists into ready-to-order online carts.
                            </p>
                            <img
                                src={LightMode ? '/images/employee.png' : '/images/employeenight.png'}
                                alt="Project Overview"
                                className="img-fluid mt-3 rounded"
                                style={{ maxHeight: '400px' }}
                            />
                        </section>
                    </>
                );

            case 'technologies':
                return (
                    <>
                        <h2 className="text-center mb-4">Technologies Used</h2>
                        <div className="container">
                            <div className="row row-cols-2 row-cols-md-3 g-3 justify-content-center">
                                {['React.js', 'Node.js & Express.js', 'MongoDB (MERN Stack)', 'Microsoft Azure OCR API', 'Bootstrap & CSS Modules', 'React Router DOM'].map((tech, index) => (
                                    <div key={index} className="col">
                                        <div className="tech-card text-center p-3 shadow-sm rounded bg-light h-100">{tech}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <nav>
                <div className="aboutcontainer d-flex justify-content-between align-items-center px-3 py-2">
                    <ul className="nav flex-wrap">
                        <li className="nav-item"><Link to="/" className='nav-link backToHome'>Home</Link></li>
                        <li className="nav-item nav-link" onClick={() => setcurrContent('company')}>Company</li>
                        <li className="nav-item nav-link" onClick={() => setcurrContent('developers')}>Developers</li>
                        <li className="nav-item nav-link" onClick={() => setcurrContent('project')}>Project</li>
                        <li className="nav-item nav-link" onClick={() => setcurrContent('technologies')}>Technologies</li>
                    </ul>
                    <img
                        src={LightMode ? '/images/sun.png' : '/images/moon.png'}
                        onClick={OnDarkMode}
                        alt="Toggle Theme"
                        className="sunmoonicon"
                        style={{ cursor: 'pointer', width: '30px' }}
                    />
                </div>
            </nav>
            <div className="content">{content()}</div>
        </>
    );
}

export default About;
