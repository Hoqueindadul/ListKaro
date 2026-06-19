import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { ArrowLeft, Loader, Mail, ShieldCheck } from "lucide-react";
import Input from "../../components/Input";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFocused, setIsFocused] = useState(false); // Manages dynamic input borders and icon teal highlighting

  const { isLoading, forgotPassword } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await forgotPassword(email);
    setIsSubmitted(true);
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
          {/* Glowing Brand Icon Container Box matching the style of image_2.png */}
          <div className="w-14 h-14 rounded-xl bg-[#031b30] border border-[#17f0db]/20 flex items-center justify-center shadow-[0_0_20px_rgba(23,240,219,0.05)]">
            <Mail className="h-6 w-6 text-[#17f0db] stroke-[1.5]" />
          </div>

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
        <div className="w-full max-w-[460px] bg-[#051c30] rounded-2xl border border-white/[0.02] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col justify-between min-h-[480px]">
          {/* Main Content Body */}
          <div className="p-8 my-auto">
            <p className="text-sm text-gray-400 text-center mb-8 leading-relaxed">
              Please enter your credentials below to safely access your account
              dashboard.
            </p>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Labeled Input Field Panel */}
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                    Email Address
                  </label>
                  <div
                    className="relative group transition-all duration-200"
                    onFocusCapture={() => setIsFocused(true)}
                    onBlurCapture={() => setIsFocused(false)}
                  >
                    <Input
                      icon={Mail}
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={`w-full pl-11 pr-4 py-3 bg-[#020e1a] text-sm text-white border transition-all duration-200 outline-none`}
                    />

                    {/* Strict CSS Injections to override specific component layouts seamlessly */}
                    <style>{`
                      .group input {
                        background-color: #020e1a !important;
                        border-radius: 0.5rem !important;
                        border-color: ${isFocused ? "rgba(23, 240, 219, 0.4)" : "#0f2b44"} !important;
                        border-width: 1px !important;
                        color: #ffffff !important;
                        padding-top: 0.8rem !important;
                        padding-bottom: 0.8rem !important;
                        font-size: 0.875rem !important;
                        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                      }
                      .group input:focus {
                        box-shadow: 0 0 12px rgba(23, 240, 219, 0.08) !important;
                      }
                      .group input::placeholder {
                         color: #4b5d6c !important;
                      }
                      .group svg {
                        color: ${isFocused ? "#17f0db" : "#4b5d6c"} !important;
                        left: 0.875rem !important;
                        transition: color 0.2s ease;
                      }
                    `}</style>
                  </div>
                </div>

                {/* Flat Action Button Panel with subtle outer borders */}
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
                      <Loader className="h-4 w-4 animate-spin text-[#17f0db]" />
                      <span>Sending link...</span>
                    </div>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            ) : (
              /* Success Email Response Frame */
              <div className="text-center py-6 space-y-5 animate-in fade-in zoom-in-95 duration-300">
                <div className="relative w-16 h-16 bg-[#020e1a] border border-[#17f0db]/30 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-[#17f0db]/5">
                  <span className="absolute inset-0 rounded-full bg-[#17f0db]/10 animate-ping opacity-75" />
                  <Mail className="h-6 w-6 text-[#17f0db] stroke-[2]" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-white font-bold text-lg tracking-tight">
                    Check your inbox
                  </h3>
                  <p className="text-gray-400 text-xs max-w-xs mx-auto leading-relaxed">
                    If an account exists for{" "}
                    <span className="text-[#17f0db] font-mono bg-[#020e1a] px-1.5 py-0.5 rounded border border-[#17f0db]/20">
                      {email}
                    </span>
                    , you will receive a secure token shortly.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Card Footer Navigation */}
          <div className="px-8 py-5 bg-[#021324]/60 border-t border-white/[0.02] flex justify-center text-xs">
            <span className="text-gray-400 font-medium">
              Remember your details?{" "}
              <Link
                to="/login"
                className="text-[#17f0db] font-bold hover:underline ml-1"
              >
                Login
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
