import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Loader,
  Lock,
  Mail,
  PhoneCall,
  User,
  ArrowLeft,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import Input from "../../components/Input";
import PasswordStrengthMeter from "../../components/PasswordStrengthMeter";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";

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
      const errorMessage =
        err.response?.data?.message || "An unexpected error occurred";
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
          <div className="p-3.5 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl w-fit shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <ShoppingBag size={28} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-slate-100 to-slate-400 text-transparent bg-clip-text mb-3">
              Join ListKaro.
            </h1>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">
              Create an account to quickly configure personal order inventories,
              save tracking sequences, and expedite system payments.
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
      <div className="flex-1 md:col-span-7 flex items-center justify-center p-6 md:p-12 z-10 overflow-y-auto">
        <div className="max-w-md w-full bg-[#0b1426]/60 border border-gray-800/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col my-8 md:my-0">
          <div className="p-8 md:p-10 flex-1">
            <div className="text-center md:text-left mb-6">
              <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-transparent bg-clip-text tracking-tight mb-2">
                Create Account
              </h2>
              <p className="text-xs font-medium text-slate-400">
                Get started today by filling out your base onboarding parameters
                below.
              </p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">
                  Full Name
                </label>
                <Input
                  icon={User}
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#070d19]/80 border-gray-800 focus:border-emerald-500 text-sm h-11"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">
                  Email Address
                </label>
                <Input
                  icon={Mail}
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#070d19]/80 border-gray-800 focus:border-emerald-500 text-sm h-11"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">
                  Phone Number
                </label>
                <Input
                  icon={PhoneCall}
                  type="text"
                  placeholder="+91 1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#070d19]/80 border-gray-800 focus:border-emerald-500 text-sm h-11"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">
                  Password
                </label>
                <Input
                  icon={Lock}
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#070d19]/80 border-gray-800 focus:border-emerald-500 text-sm h-11"
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl font-medium">
                  {error}
                </p>
              )}

              <div className="pt-1">
                <PasswordStrengthMeter password={password} />
              </div>

              <button
                className="w-full h-11 mt-6 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white rounded-xl text-xs font-bold transition-all duration-300 transform active:scale-[0.98] shadow-[0_4px_20px_rgba(16,185,129,0.25)] flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  "Complete Registration"
                )}
              </button>
            </form>
          </div>

          {/* Card Footer Segment */}
          <div className="px-8 py-4 bg-[#070d19]/60 border-t border-gray-800/60 flex justify-center text-center">
            <p className="text-xs font-medium text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-emerald-400 hover:text-emerald-300 font-bold ml-1 transition-colors no-underline"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
