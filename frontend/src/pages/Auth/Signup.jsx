import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader, Lock, Mail, PhoneCall, User } from "lucide-react";
import Input from "../../components/Input";
import PasswordStrengthMeter from "../../components/PasswordStrengthMeter";
import toast from 'react-hot-toast';
import { useAuthStore } from "../../store/authStore";
import "./Signup.css"

const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");

    const navigate = useNavigate();
    const { signup, error, isLoading } = useAuthStore();

    const handleSignUp = async (e) => {
        e.preventDefault();

        if (!name || !email || !password || !phone) {
            toast.error("Please fill in all fields.");
            return;
        }

        try {
            await signup(email, password, name, phone);
            toast.success("Verify your email");
            navigate("/emailVerification");
        } catch (err) {
            console.log(err);
            toast.error(err?.message || "Something went wrong");
        }
    };

    return (
        
        <div className="min-h-screen flex items-center justify-center ">
            
        <div className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden'>
            <div className='p-8'>
                <h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>
                    Create Account
                </h2>

                <form onSubmit={handleSignUp}>
                    <Input
                        icon={User}
                        type='text'
                        placeholder='Full Name'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <Input
                        icon={Mail}
                        type='email'
                        placeholder='Email Address'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                        icon={PhoneCall}
                        type='text'
                        placeholder='Phone Number'
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    <Input
                        icon={Lock}
                        type='password'
                        placeholder='Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {error && <p className='text-red-500 font-semibold mt-2'>{error}</p>}

                    <PasswordStrengthMeter password={password} />

                    <button
                        className='signupSubmitBtn'
                        type='submit'
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader className='animate-spin mx-auto' size={24} /> : "Sign Up"}
                    </button>
                </form>
            </div>

            <div className='px-4 py-3 bg-gray-900 bg-opacity-50 flex justify-center'>
                <p className=' text-gray-400'>
                    Already have an account?{" "}
                    <Link to={"/login"} className='loginLink'>
                        Login
                    </Link>
                </p>
            </div>
            
        </div>
        </div>
    );
};

export default Signup;
