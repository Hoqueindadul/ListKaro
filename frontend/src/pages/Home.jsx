import './Home.css'

function Home(){
    return(
        <>
            {/* <div className="container"> */}

            {/* <div className="left">

                <div className="logo_container">
                    <div className="login"></div>
                </div>

                <div className="navbar">
                    <ul>
                        <li>Home</li>
                        <li>Products</li>
                        <li>About</li>
                        <li>Upload List</li>
                    </ul>
                </div>
                </div> */}

                {/* <div className="right">  */}

                    <div className="graphic">
                    </div>
                    <h3 id="categories_title">Categories</h3>
                    <div className="products">
                        <div className="card" id="electronics"></div>
                        <div className="card" id="groceries"></div>
                        <div className="card" id="snacks"></div>
                    </div>

                    <div className="btn_container">
                        <button className="viewbtn">View all products</button>
                    </div>

                    <div className="footer">
                        <div className="title">
                        <h1>ListKaro</h1>
                        <p>Shopping at one click</p>
                        </div>
                        <form action=" ">
                        <input type="text" name="emailholder" id="em_holder" placeholder="Your E-Mail Address"/> 
                        <input type="submit" value="Subscribe" id="btn" />
                        </form>
                        <div className="contact">
                            <h2> Contact us </h2>
                            <p>Email : contact@listkaro.com</p>
                            <p>Phone no : +91 839272122</p>
                            <p>69LA, MJ Road, Berhampore</p>
                            <p>West Bengal, India</p>
                        </div>
                    </div> 



                {/* </div>  */}

            {/* </div> */}


        
        </>
    )
}

export default Home