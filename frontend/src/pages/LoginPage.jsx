import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Mail, Lock, Loader } from "lucide-react";
import toast from 'react-hot-toast';
import Input from "../components/Input";
import "./LoginPage.css";

const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { login, isLoading, error } = useAuthStore();
	const navigate = useNavigate();
	const location = useLocation();
	const from = location.state?.from?.pathname || "/";

	const handleLogin = async (e) => {
		e.preventDefault();
		try {
			await login(email, password);
			toast.success("You are logged in successfully");

			setTimeout(() => {
				navigate(from, { replace: true });
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
			<div className=" flex items-center justify-center ">
				<div
					className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden'
				>
					<div className='p-8'>
						<h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>
							Welcome Back
						</h2>

						<form onSubmit={handleLogin}>
							<Input
								icon={Mail}
								type='email'
								placeholder='Email Address'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>

							<Input
								icon={Lock}
								type='password'
								placeholder='Password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>

							<div className='flex justify-end mb-6'>
								<Link to='/forgot-password' className='forgotPass '>
									Forgot password?
								</Link>
							</div>
							{error && <p className='text-red-500 font-semibold mb-2'>{error}</p>}

							<button
								className='loginSubmitBtn '
								type='submit'
								disabled={isLoading}
							>
								{isLoading ? <Loader className='w-6 h-6 animate-spin mx-auto' /> : "Login"}
							</button>

						</form>
					</div>
					<div className='px-4 py-3 bg-gray-900 bg-opacity-50 flex justify-center'>
						<p className=' text-gray-400'>
							Don't have an account?{" "}
							<Link to='/signup' className='signupLink'>
								Sign up
							</Link>
						</p>
					</div>
				</div>
			</div>
		</>
	);
};

export default LoginPage;