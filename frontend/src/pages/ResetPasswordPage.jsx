import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { toast } from 'react-hot-toast';
import { Lock } from "lucide-react";
import "./LoginPage.css";

const ResetPasswordPage = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { resetPassword, error, isLoading, message } = useAuthStore();

    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        try {
            await resetPassword(token, password);

            toast.success("Password reset successfully, redirecting to login page...");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Error resetting password");
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 bg-opacity-60 backdrop-blur-md rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">Reset Password</h2>

        {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}
        {message && <p className="text-green-500 text-sm mb-3 text-center">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2 rounded-md bg-white bg-opacity-10 border border-gray-600 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2 rounded-md bg-white bg-opacity-10 border border-gray-600 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 resetPasswordBtn font-semibold transition  ${
              isLoading
                ? ' bg-gray-900 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-800'
            } text-white`}
          >
            {isLoading ? 'Resetting...' : 'Set New Password'}
          </button>
        </form>
      </div>
    </div>
    );
};

export default ResetPasswordPage;