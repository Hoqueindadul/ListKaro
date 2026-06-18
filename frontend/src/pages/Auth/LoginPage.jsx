import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  Mail,
  Lock,
  Loader,
  ArrowLeft,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import toast from "react-hot-toast";
import Input from "../../components/Input";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  // handle login
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
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please try again.";
      console.error("Login error:", errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-[#070d19] text-white flex flex-col md:grid md:grid-cols-12 overflow-hidden font-sans select-none relative">
      {/* Background Decorative Ambient Flares */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* --- LEFT HAND SIDE: Immersive Interactive Branding Frame --- */}
      <div className="hidden md:flex md:col-span-5 bg-[#0b1426] border-r border-gray-800/60 p-10 flex-col justify-between relative overflow-hidden">
        {/* Abstract subtle line mesh grid layer */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111827_1px,transparent_1px),linear-gradient(to_bottom,#111827_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

        {/* Home Redirect Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-cyan-400 transition-colors duration-200 z-10 w-fit group"
        >
          <ArrowLeft
            size={14}
            className="transform group-hover:-translate-x-1 transition-transform"
          />
          Back to Home
        </Link>

        {/* Branding Intro Center Text */}
        <div className="my-auto z-10 space-y-5 max-w-sm">
          <div className="p-3.5 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl w-fit shadow-[0_0_20px_rgba(34,211,238,0.1)]">
            <ShoppingBag size={28} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-slate-100 to-slate-400 text-transparent bg-clip-text mb-3">
              ListKaro.
            </h1>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">
              Your simplified platform to list items, handle micro-inventories,
              and track premium bulk orders in real-time.
            </p>
          </div>
        </div>

        {/* Bottom trust footer text */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium z-10">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>End-to-End Encrypted Transactions</span>
        </div>
      </div>

      {/* Mobile-only Home Button Layer */}
      <div className="md:hidden p-6 pb-2 z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-cyan-400 transition-colors duration-200"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </div>

      {/* --- RIGHT HAND SIDE: Core Form Authentication Portal --- */}
      <div className="flex-1 md:col-span-7 flex items-center justify-center p-6 md:p-12 z-10">
        <div className="max-w-md w-full bg-[#0b1426]/60 border border-gray-800/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col">
          <div className="p-8 md:p-10 flex-1">
            <div className="text-center md:text-left mb-8">
              <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-transparent bg-clip-text tracking-tight mb-2">
                Welcome Back
              </h2>
              <p className="text-xs font-medium text-slate-400">
                Please enter your credentials below to safely access your
                account dashboard.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                  Email Address
                </label>
                <Input
                  icon={Mail}
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#070d19]/80 border-gray-800 focus:border-cyan-500 text-sm h-11"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors no-underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  icon={Lock}
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#070d19]/80 border-gray-800 focus:border-cyan-500 text-sm h-11"
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl font-medium">
                  {error}
                </p>
              )}

              <button
                className="w-full h-11 mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl text-xs font-bold transition-all duration-300 transform active:scale-[0.98] shadow-[0_4px_20px_rgba(6,182,212,0.25)] flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  "Sign In to Account"
                )}
              </button>
            </form>
          </div>

          {/* Card Footer Segment */}
          <div className="px-8 py-4 bg-[#070d19]/60 border-t border-gray-800/60 flex justify-center text-center">
            <p className="text-xs font-medium text-slate-400">
              Don't have an account yet?{" "}
              <Link
                to="/signup"
                className="text-cyan-400 hover:text-cyan-300 font-bold ml-1 transition-colors no-underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
