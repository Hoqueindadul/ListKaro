import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { toast } from "react-hot-toast";
import { Lock, ArrowLeft, ShieldCheck } from "lucide-react";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [focusedInput, setFocusedInput] = useState(null); // Track field focus for active cyan icon states
  const { resetPassword, error, isLoading, message } = useAuthStore();

  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await resetPassword(token, password);

      toast.success(
        "Password reset successfully, redirecting to login page...",
      );
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error resetting password");
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#031525] text-gray-100 selection:bg-[#17f0db]/20 selection:text-[#17f0db] font-sans antialiased">
      {/* ================= LEFT SIDE: INFORMATION PANEL ================= */}
      <div className="hidden md:flex md:w-[45%] lg:w-[40%] flex-col justify-between p-12 bg-[#020e1a] border-r border-[#082036]/50">
        {/* Top Navigation Back Link */}
        <div>
          <Link
            to="/"
            className="text-xs font-bold tracking-widest text-gray-400 hover:text-[#17f0db] uppercase flex items-center gap-2 transition-colors duration-200"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Home
          </Link>
        </div>

        {/* Center Descriptive Core */}
        <div className="space-y-6 max-w-sm">
          {/* Glowing Brand Icon Container Box */}
          <div className="w-14 h-14 rounded-xl bg-[#031b30] border border-[#17f0db]/20 flex items-center justify-center shadow-[0_0_20px_rgba(23,240,219,0.05)]">
            <Lock className="h-6 w-6 text-[#17f0db] stroke-[1.5]" />
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white">
            Secure Your Account
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed font-medium">
            Your simplified platform to list items, handle micro-inventories,
            and track premium bulk orders in real-time.
          </p>
        </div>

        {/* Bottom Security Footer Item */}
        <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold tracking-wide">
          <ShieldCheck className="h-4 w-4 text-[#17f0db]/60" />
          <span>End-to-End Encrypted Access</span>
        </div>
      </div>

      {/* ================= RIGHT SIDE: TEXTURED FORM LAYER ================= */}
      <div className="flex-1 flex items-center justify-center px-6 lg:px-12 bg-[#031525]">
        {/* Rounded Realistic Card Structure mimicking ListKaro dashboard module */}
        <div className="w-full max-w-[460px] bg-[#051c30] rounded-2xl border border-white/[0.02] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col justify-between min-h-[520px]">
          {/* Main Content Body */}
          <div className="p-8 my-auto w-full">
            <p className="text-sm text-gray-400 text-center mb-6 leading-relaxed">
              Please enter your unique credentials below to safely update your
              account dashboard password.
            </p>

            {/* Info and Error Banners formatted cleanly for this layout */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-xs text-center font-medium">
                  {error}
                </p>
              </div>
            )}
            {message && (
              <div className="mb-4 p-3 bg-[#17f0db]/10 border border-[#17f0db]/20 rounded-lg">
                <p className="text-[#17f0db] text-xs text-center font-medium">
                  {message}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password Input Field */}
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                  New Password
                </label>
                <div className="relative group">
                  <Lock
                    className={`absolute left-3.5 top-3.5 h-4 w-4 transition-colors duration-200 z-10 ${
                      focusedInput === "pass"
                        ? "text-[#17f0db]"
                        : "text-[#4b5d6c]"
                    }`}
                  />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onFocus={() => setFocusedInput("pass")}
                    onBlur={() => setFocusedInput(null)}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`w-full pl-11 pr-4 py-3 bg-[#020e1a] text-sm text-white border rounded-lg transition-all duration-200 outline-none ${
                      focusedInput === "pass"
                        ? "border-[#17f0db]/40 ring-2 ring-[#17f0db]/5"
                        : "border-[#0f2b44] group-hover:border-[#143654]"
                    }`}
                  />
                </div>
              </div>

              {/* Confirm Password Input Field */}
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock
                    className={`absolute left-3.5 top-3.5 h-4 w-4 transition-colors duration-200 z-10 ${
                      focusedInput === "confirm"
                        ? "text-[#17f0db]"
                        : "text-[#4b5d6c]"
                    }`}
                  />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onFocus={() => setFocusedInput("confirm")}
                    onBlur={() => setFocusedInput(null)}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`w-full pl-11 pr-4 py-3 bg-[#020e1a] text-sm text-white border rounded-lg transition-all duration-200 outline-none ${
                      focusedInput === "confirm"
                        ? "border-[#17f0db]/40 ring-2 ring-[#17f0db]/5"
                        : "border-[#0f2b44] group-hover:border-[#143654]"
                    }`}
                  />
                </div>
              </div>

              {/* Flat Action Button Panel with outer boundaries */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 font-bold text-sm rounded-lg tracking-wide transition-all duration-200 shadow-md ${
                  isLoading
                    ? "bg-[#06243d] text-gray-500 cursor-not-allowed border border-[#0f2b44]"
                    : "bg-[#020e1a] text-gray-100 border border-[#0f2b44] hover:border-[#17f0db]/50 hover:shadow-[0_0_20px_rgba(23,240,219,0.08)] active:scale-[0.99]"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-[#17f0db]"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Resetting...</span>
                  </div>
                ) : (
                  "Set New Password"
                )}
              </button>
            </form>
          </div>

          {/* Bottom Card Footer Navigation */}
          <div className="px-8 py-5 bg-[#021324]/60 border-t border-white/[0.02] flex justify-center text-xs">
            <span className="text-gray-400 font-medium">
              Remembered your credentials?{" "}
              <Link
                to="/login"
                className="text-[#17f0db] font-bold hover:underline ml-1"
              >
                Sign In
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
