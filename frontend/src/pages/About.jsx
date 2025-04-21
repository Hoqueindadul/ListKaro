import React, { useState, useEffect } from 'react';
import './About.css'; 
import './AboutDark.css'

function About() {
    const [currContent, setcurrContent] = useState('company');
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
                } 
            else {
                  setLightMode(true);
                  document.body.classList.remove('dark');
                }
              }, []);
    

    const content = () => {
        switch (currContent) {
          case 'company':
            return (
                <>
                <div className="logocontainer">

                    <img src="/images/logo.png" alt="" />
                    <h1>ListKaro</h1>

                </div>
                <hr/>
                <div className="companydetails">
                    <p>
                        <strong>ListKaro</strong> is your one-stop online destination for all your grocery and food essentials.
                        From fresh  — <br/> <b> dairy products and pantry staples to canned goods, snacks, chocolates, cakes, </b> and more <br/>
                        we bring everything you need right to your doorstep.<br/>  <br/> 
                        <ul>
                            <li>Enjoy <strong>free delivery</strong> on orders above ₹499 </li>
                            <li>superfast delivery within <strong> 45 minutes</strong></li>
                            <li><strong>Upload Your Grocery List </strong>& Buy Everything at Once</li>
                            <li>Exclusive <strong>Discounts</strong>  on All Dairy Products! </li>
                        </ul>
                        <br />
                        What makes ListKaro truly unique is our <strong>smart list upload</strong> feature
                        customers can simply upload an image or file of their handwritten or typed shopping list,<br/>
                        and our AI technology will automatically detect the items and create a cart, ready for checkout in seconds.
                        Say goodbye to manual searches and hello to effortless shopping!<br/>
                        We support multiple secure payment methods through trusted partners like <strong>Visa, PhonePe, Paytm, UPI</strong>, and more,
                        making your checkout smooth and reliable.<br/>
                        
                        With ListKaro, shopping is not just faster — it's smarter.
                    </p>
                    <img src={LightMode? '/images/hq.png' : '/images/hqnight.png'} alt="" height={'600px'} width={'600px'}   />




                </div>
                </>
            )

          case 'developers':
            return (
            <>
                <div className="jabed">
                    <div className="details">
                        <h2>Md Abu Jabed</h2>
                        <h6>Bca Student</h6>
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus dolore fuga non alias odit, placeat voluptatem culpa saepe est officiis enim. Beatae minus repellat corrupti nobis saepe unde incidunt sunt.</p>
                    </div>
                    <div className="dp">
                        <img src="/images/jabed.jpg" alt="" width={'500px'} height={'300px'}/>
                    </div>
                </div>
                <hr />
                <div className="indadul">
                    <div className="dp">
                        <img src="/images/indadul.png" alt="" width={'500px'} height={'300px'}/>
                    </div>
                    <div className="details">
                        <h2>Indadul</h2>
                        <h6>Bca Student</h6>
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus dolore fuga non alias odit, placeat voluptatem culpa saepe est officiis enim. Beatae minus repellat corrupti nobis saepe unde incidunt sunt.</p>
                    </div>

                </div>
            </>
            )


          case 'project':
            return (
                <>
                <h1 style={{textAlign:'center'}}>ListKaro OCR Project</h1><hr />
                 <section className='projectcontainer'>
                    <p>
                        The <strong>ListKaro</strong> project is an innovative eCommerce platform designed to streamline the
                        shopping experience by leveraging Optical Character Recognition (OCR) technology. The core functionality 
                        revolves around enabling users to upload images of handwritten shopping lists, which are then processed to
                        extract item names and quantities using <strong>Microsoft Azure OCR</strong>.,<br />
                        Once the items are identified, the system searches for them in the product database, matches the item names,
                        and adds them to the user's cart automatically. This eliminates the need for manual item entry, enhancing both
                        convenience and accuracy. <br/>
                        Users scan then proceed with the checkout process in one seamless flow.
                        The project aims to make the shopping experience faster, more intuitive,
                        and error-free by automating the traditionally time-consuming process of adding items to the cart. 
                        It also represents a step forward in integrating AI and machine learning into everyday activities,
                        improving accessibility and user engagement. The use of OCR ensures that even handwritten lists, often 
                        prone to errors or ambiguity, are accurately understood and processed, making it a cutting-edge solution 
                        for modern eCommerce.
                    </p>
                    <img src="/images/employee.png" alt="" height={'550px'} width={'800px'} style={{borderRadius:'10px'}}/>
                    </section>
                </>
            )

          case 'technologies':
            return(
                <>
                </>
            ) 

            

        }
      };
    return(
        <>
            <nav className="navbar my-navbar">
                <div className="aboutcontainer"> 
                    <ul>
                        <a href="/"> <li> Home</li> </a>
                        <li onClick={() => setcurrContent('company')}>Company</li>
                        <li onClick={() => setcurrContent('developers')}>Developers</li>
                        <li onClick={() => setcurrContent('project')}>Project</li>
                        <li onClick={() => setcurrContent('technologies')}>Technologies Used</li>
                        <img src={LightMode? '/images/sun.png' : '/images/moon.png'} onClick={OnDarkMode} alt="Image" className="sunmoonicon" />
                    </ul>
                </div>
            </nav>

            <div className="content">
                {content()}
            </div>
        </>
    )
}
export default About