import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
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
        <div className="login-page">
            <div className="login-card">
                <h2>Reset Password</h2>
                {error && <p className="text-danger small mb-3">{error}</p>}
                {message && <p className="text-success small mb-3">{message}</p>}

              
                    <form onSubmit={handleSubmit}>
                        <div className="logininput-group">
                            <Lock className="input-icon" />
                            <input
                                type='password'
                                placeholder='New Password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="logininput-group">
                            <Lock className="input-icon" />
                            <input
                                type='password'
                                placeholder='Confirm New Password'
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>



                        <button type="submit" className="login-btn" disabled={isLoading}>
                            {isLoading ? "Resetting..." : "Set New Password"}
                        </button>
                    </form>
            </div>

        </div>
    );
};

export default ResetPasswordPage;