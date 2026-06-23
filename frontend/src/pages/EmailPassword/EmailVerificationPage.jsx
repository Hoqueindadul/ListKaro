import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { toast } from "react-hot-toast";
import { ArrowLeft, Loader, Mail, ShieldCheck } from "lucide-react";

export default function EmailVerificationPage() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [focusedIndex, setFocusedIndex] = useState(null); // Track active OTP block for matching glow borders
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { error, isLoading, verifyEmail } = useAuthStore();

  // Handle email verification
  const handleVerification = async (verificationCode) => {
    try {
      await verifyEmail(verificationCode);
      toast.success("Email verified successfully");
      navigate("/login");
    } catch (err) {
      console.error("Verification failed:", err);
      toast.error(err?.message || "Something went wrong. Please try again.");
    }
  };

  // Handle input change
  const handleChange = (index, value) => {
    const newCode = [...code];

    if (value.length > 1) {
      const pastedCode = value.trim().slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || "";
      }
      setCode(newCode);

      const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex]?.focus();
    } else {
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handle key down
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!code[index] && index > 0) {
        const newCode = [...code];
        newCode[index - 1] = "";
        setCode(newCode);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      }
    }
  };

  //
  const handleSubmit = (e) => {
    e.preventDefault();
    const verificationCode = code.join("");
    if (verificationCode.length === 6) {
      handleVerification(verificationCode);
    }
  };

  // Handle effect
  useEffect(() => {
    const verificationCode = code.join("");
    if (verificationCode.length === 6) {
      handleVerification(verificationCode);
    }
  }, [code]);

  const isSubmitDisabled = isLoading || code.some((digit) => !digit);

  return (
    <div className="min-h-screen w-full flex bg-[#031525] text-gray-100 selection:bg-[#17f0db]/20 selection:text-[#17f0db] font-sans antialiased">
      {/* LEFT SIDE: INFORMATION PANEL*/}
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
            <Mail className="h-6 w-6 text-[#17f0db] stroke-[1.5]" />
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white">
            Identity Verification
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

      {/* RIGHT SIDE: TEXTURED FORM LAYER */}
      <div className="flex-1 flex items-center justify-center px-6 lg:px-12 bg-[#031525]">
        {/* Rounded Realistic Card Structure mimicking ListKaro dashboard module */}
        <div className="w-full max-w-[460px] bg-[#051c30] rounded-2xl border border-white/[0.02] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col justify-between min-h-[480px]">
          {/* Main Content Body */}
          <div className="p-8 my-auto w-full">
            <p className="text-sm text-gray-400 text-center mb-8 leading-relaxed">
              Enter the secure 6-digit verification code sent to your email
              address to unlock your dashboard access.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Labeled Code Input Block Grid */}
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wider text-gray-400 uppercase block text-center md:text-left">
                  Verification Token
                </label>

                <div className="flex justify-between gap-2">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onFocus={() => setFocusedIndex(index)}
                      onBlur={() => setFocusedIndex(null)}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={`w-12 h-14 text-center text-xl font-bold bg-[#020e1a] text-white border rounded-lg transition-all duration-200 outline-none ${
                        focusedIndex === index
                          ? "border-[#17f0db]/50 ring-2 ring-[#17f0db]/5 shadow-[0_0_10px_rgba(23,240,219,0.05)]"
                          : "border-[#0f2b44] hover:border-[#143654]"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Error Banner formatted for this layout */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-in fade-in zoom-in-95 duration-200">
                  <p className="text-red-400 text-xs text-center font-medium">
                    {error}
                  </p>
                </div>
              )}

              {/* Flat Action Button Panel with subtle boundaries */}
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className={`w-full py-3.5 font-bold text-sm rounded-lg tracking-wide transition-all duration-200 shadow-md evaluation-btn ${
                  isSubmitDisabled
                    ? "bg-[#06243d] text-gray-500 cursor-not-allowed border border-[#0f2b44]"
                    : "bg-[#020e1a] text-gray-100 border border-[#0f2b44] hover:border-[#17f0db]/50 hover:shadow-[0_0_20px_rgba(23,240,219,0.08)] active:scale-[0.99]"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="h-4 w-4 animate-spin text-[#17f0db]" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  "Verify Email"
                )}
              </button>
            </form>
          </div>

          {/* Bottom Card Footer Navigation */}
          <div className="px-8 py-5 bg-[#021324]/60 border-t border-white/[0.02] flex justify-center text-xs">
            <span className="text-gray-400 font-medium">
              Didn't receive a token?{" "}
              <Link
                to="/login"
                className="text-[#17f0db] font-bold hover:underline ml-1"
              >
                Back to Sign In
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
