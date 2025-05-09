import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { Mail, Lock, Loader } from "lucide-react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';

import "./LoginPage.css";

const LoginPage = () => {
    const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();
	const { login, isLoading, error } = useAuthStore();

	const handleLogin = async (e) => {
		e.preventDefault();
		try {
			await login(email, password);
			toast.success("You are logged in successfully");
			
			setTimeout(() => {
				navigate("/");
			}, 2000);
		} catch (error) {
			const errorMessage =
				error.response?.data?.message || error.message || "Login failed. Please try again.";
			console.error("Login error:", errorMessage);
			toast.error(errorMessage);
		}
	};




    return (
		<>
		
        <div className="login-page">
			<div className="login-card">
				<h2>Welcome Back</h2>
				<form onSubmit={handleLogin}>
					<div className="logininput-group">
						<Mail className="input-icon" />
						<input
							type="email"
							placeholder="Email Address"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
					<div className="logininput-group">
						<Lock className="input-icon" />
						<input
							type="password"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>
					<div className="forgot">
                        <Link to='/forgot-password'>
							Forgot password?
						</Link>
					</div>
                    {error && <p className='text-red font-semibold mb-2'>{error}</p>}

					<button type="submit" className="login-btn" disabled={isLoading}>
						{isLoading ? "Logging in..." : "Login"}
					</button>
				</form>
				<p className="signup-link">
					Don't have an account? <a href="/register">Sign up</a>
				</p>
			</div>
			<ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
		</div>
		</>
    );
};

export default LoginPage;