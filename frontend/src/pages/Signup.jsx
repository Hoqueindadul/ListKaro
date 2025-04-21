import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const SignUp = ({ showPopup, setShowPopup }) => {
    if (!showPopup) return null;
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    const handleRegistration = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:5000/api/auth/signup", formData);
            console.log("User registered:", response.data);
            toast.success("Verify Your Email")
            setShowPopup(false);
            navigate("/emailVerification")
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Registration failed. Please try again.";
            console.error("Registration error:", errorMessage);
            alert(errorMessage); // Show the backend error message or a fallback message
        }
    };



    return (
        <div className="signupcontainer">
            <div className="signheader">
                <span className="signuptitle">Sign Up</span>
                <span onClick={() => setShowPopup(false)} className="close"> X </span>
            </div>

            <form onSubmit={handleRegistration}>
                <input name="name" type="text" placeholder="Enter your name" required value={formData.name} onChange={handleChange} /><br />
                <input name="email" type="email" placeholder="Enter your email" required autoComplete="off" value={formData.email} onChange={handleChange} /><br />
                <input name="password" type="password" placeholder="Set a password" required autoComplete="off" value={formData.password} onChange={handleChange} /><br />
                <input name="phone" type="tel" placeholder="Phone Number (Optional)"
                    value={formData.phone}
                    onChange={handleChange}
                />
                <br />
                By signing up, you agree to our <a href="" style={{ textDecoration: 'none' }}>terms and conditions</a><br /><br />
                <input type="submit" value="Signup" className="signupbtn" />
            </form>

            <p style={{ textAlign: 'center' }}>Already have an account? <a href="" style={{ textDecoration: 'none' }}>Log in</a></p>
        </div>
    );
};

export default SignUp;