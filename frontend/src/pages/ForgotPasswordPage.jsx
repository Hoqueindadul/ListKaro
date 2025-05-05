import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { ArrowLeft, Loader, Mail } from "lucide-react";
import "./LoginPage.css";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const { isLoading, forgotPassword } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await forgotPassword(email);
        setIsSubmitted(true);
    };
    return (
        <div className="login-page">
            <div className="login-card">
                <h2>Forgot Password</h2>
                {!isSubmitted ? (
                    <form onSubmit={handleSubmit}>
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
                        <button type="submit" className="login-btn" disabled={isLoading}>
                            {isLoading ? (
                                <Loader className="spinner-border text-light mx-auto d-block" />
                            ) : (
                                "Send Reset Link"
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="text-center">
                        <div
                            className="d-flex align-items-center justify-content-center mx-auto mb-4 rounded-circle bg-success"
                            style={{
                                width: "64px",
                                height: "64px",
                                transform: "scale(1)",
                                transition: "transform 0.5s ease-out"
                            }}
                        >
                            <Mail className="text-white" style={{ width: "32px", height: "32px" }} />
                        </div>
                        <p className="text-light mb-4">
                            If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
                        </p>
                    </div>

                )}
                <div className="py-3 px-4 w-100 mt-2" style={{ backgroundColor: "#0e0f1c", borderBottomLeftRadius: "12px", borderBottomRightRadius: "12px", maxWidth: "420px" }}>
                    <div className="d-flex justify-content-center">
                        <Link
                            to="/login"
                            className="text-success text-decoration-none d-flex align-items-center small fw-semibold"
                        >
                            <ArrowLeft className="me-2" style={{ width: "16px", height: "16px" }} />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
            
        </div>
    );
};

export default ForgotPasswordPage;