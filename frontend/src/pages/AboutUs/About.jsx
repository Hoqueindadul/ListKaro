import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Users2,
  Cpu,
  Layers,
  Home,
  CheckCircle2,
  Rocket,
  Zap,
  Code2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function About() {
  const [currContent, setcurrContent] = useState("company");

  // Navigation tab matrix configuration
  const navigationTabs = [
    { id: "company", label: "Company", icon: Building2 },
    { id: "developers", label: "Developers", icon: Users2 },
    { id: "project", label: "OCR Project", icon: Cpu },
    { id: "technologies", label: "Technologies", icon: Layers },
  ];

  const renderContent = () => {
    switch (currContent) {
      case "company":
        return (
          <div className="space-y-12 animate-[fadeIn_0.3s_ease-out]">
            {/* Hero Brand Section */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-3 bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20">
                <img
                  src="/images/logo.png"
                  alt="Logo"
                  className="w-6 h-6 object-contain"
                />
                <span className="text-xs font-black tracking-widest text-cyan-400 uppercase">
                  Introducing ListKaro
                </span>
              </div>
              <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Smarter Grocery Shopping
              </h1>
            </div>

            {/* Layout Grid Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-6 text-gray-300 leading-relaxed text-sm">
                <p>
                  <strong className="text-white font-extrabold">
                    ListKaro
                  </strong>{" "}
                  is your premium digital gateway for all everyday essentials.
                  We bridge the gap between fresh farm dairy aggregates and
                  seamless instant home delivery arrays.
                </p>

                {/* Visual Value Props list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    "Free delivery over ₹499",
                    "Hyperfast 45-min delivery",
                    "Automated AI cart imports",
                    "Exclusive dairy pricing metrics",
                  ].map((text, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-gray-900/40 p-3 rounded-xl border border-gray-800/50"
                    >
                      <CheckCircle2
                        size={16}
                        className="text-emerald-500 flex-shrink-0"
                      />
                      <span className="font-bold text-gray-200 text-xs">
                        {text}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="bg-gray-900/40 border border-gray-800/60 p-4 rounded-2xl">
                  What makes us truly revolutionary is our{" "}
                  <span className="text-cyan-400 font-extrabold">
                    Smart OCR pipeline
                  </span>
                  . Simply snapshot your handwritten grocery text list; our
                  custom cloud infrastructure builds your electronic cart
                  pipeline instantly.
                </p>
              </div>

              <div className="relative rounded-3xl overflow-hidden border border-gray-800 shadow-xl group bg-gray-900">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/40 to-transparent z-10" />
                <img
                  src="/images/hqnight.png"
                  alt="Headquarters Overview"
                  className="w-full h-[380px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        );

      case "developers":
        return (
          <div className="space-y-10 animate-[fadeIn_0.3s_ease-out]">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-white">
                The Engineering Minds
              </h2>
              <p className="text-xs text-gray-400">
                Architects of the core ListKaro character processing application
                matrix
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Dev 1 Card */}
              <div className="bg-[#0b1426] border border-gray-800/60 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-center">
                <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-gray-800 shadow-md">
                  <img
                    src="/images/jabed.jpg"
                    alt="Md Abu Jabed"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2 text-center md:text-left flex-1 min-w-0">
                  <span className="text-[10px] font-extrabold text-cyan-400 tracking-widest uppercase">
                    MERN Full-Stack Developer
                  </span>
                  <h3 className="text-lg font-black tracking-tight text-white">
                    Md Abu Jabed
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-4">
                    Passionate tech innovator specializing in cloud stack
                    architectures and web infrastructures. Spearheaded core
                    system module parameters with an integrated background
                    processing structure across Python and Node layout
                    architectures.
                  </p>
                </div>
              </div>

              {/* Dev 2 Card */}
              <div className="bg-[#0b1426] border border-gray-800/60 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-center">
                <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-gray-800 shadow-md">
                  <img
                    src="/images/indadul.png"
                    alt="Indadul Hoque"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2 text-center md:text-left flex-1 min-w-0">
                  <span className="text-[10px] font-extrabold text-cyan-400 tracking-widest uppercase">
                    Database Systems Engineer
                  </span>
                  <h3 className="text-lg font-black tracking-tight text-white">
                    Indadul Hoque
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-4">
                    Software engineer specialized in system UI engineering
                    frameworks, clean database abstractions, and real-time
                    backend updates. Deeply focused on parsing optimization
                    vectors that translate processing metrics into reliable
                    customer transactions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "project":
        return (
          <div className="space-y-8 max-w-3xl mx-auto text-center animate-[fadeIn_0.3s_ease-out]">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                <Sparkles size={12} /> Innovation Showcase
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">
                Computer Vision Integration
              </h2>
              <p className="text-sm text-gray-400 max-w-xl mx-auto">
                Discover how ListKaro eliminates manual catalog browsing
                constraints by executing direct intelligent string segment
                conversions.
              </p>
            </div>

            <div className="bg-[#0b1426] border border-gray-800/60 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                {[
                  {
                    icon: Code2,
                    label: "1. Capture List",
                    desc: "User uploads a snapped image of handwritten items.",
                  },
                  {
                    icon: Zap,
                    label: "2. Cloud OCR",
                    desc: "Azure Cognitive services decode textual raw string segments.",
                  },
                  {
                    icon: Rocket,
                    label: "3. Auto-Cart",
                    desc: "System targets database models and adds matching products instantly.",
                  },
                ].map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gray-900/30 border border-gray-800 rounded-2xl space-y-2"
                  >
                    <step.icon size={20} className="text-cyan-400" />
                    <h4 className="text-xs font-extrabold tracking-tight text-white">
                      {step.label}
                    </h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl overflow-hidden border border-gray-800/80 max-h-[300px]">
                <img
                  src="/images/employeenight.png"
                  alt="System Process Map"
                  className="w-full h-full object-contain mx-auto"
                />
              </div>
            </div>
          </div>
        );

      case "technologies":
        return (
          <div className="space-y-8 max-w-4xl mx-auto animate-[fadeIn_0.3s_ease-out]">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-white">
                System Architecture Map
              </h2>
              <p className="text-xs text-gray-400">
                High-performance tooling components driving our automation
                cluster
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { name: "React.js", category: "Frontend Interface" },
                { name: "Node.js & Express", category: "Core Backend Service" },
                { name: "MongoDB Atlas", category: "Distributed Storage" },
                { name: "Microsoft Azure OCR", category: "Computer Vision" },
                { name: "Tailwind CSS", category: "Responsive Framework" },
                { name: "React Router DOM", category: "Navigation Handling" },
              ].map((tech, idx) => (
                <div
                  key={idx}
                  className="bg-[#0b1426] border border-gray-800/60 rounded-2xl p-4 flex flex-col justify-between hover:border-cyan-500/40 transition-colors shadow-sm group"
                >
                  <h4 className="text-sm font-black text-white group-hover:text-cyan-400 transition-colors">
                    {tech.name}
                  </h4>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-4">
                    {tech.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#070d19] text-white transition-colors duration-200 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* ================= COMPONENT NAVBAR ================= */}
        <nav className="bg-[#0b1426]/60 backdrop-blur-md border border-gray-800/60 rounded-2xl p-3 shadow-sm flex items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-cyan-600 rounded-xl text-xs font-bold transition-all duration-200 group"
            >
              <Home size={14} />
              <span>Home</span>
              <ArrowRight
                size={12}
                className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
              />
            </Link>
          </div>

          {/* Core Tab Links */}
          <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden max-w-full">
            {navigationTabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setcurrContent(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all duration-150 ${
                    currContent === tab.id
                      ? "bg-cyan-950/30 text-cyan-400"
                      : "text-gray-400 hover:bg-gray-800/40"
                  }`}
                >
                  <TabIcon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* ================= COMPONENT INTERACTIVE CANVAS ================= */}
        <main className="bg-[#0b1426] border border-gray-800/60 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden min-h-[460px]">
          {/* Decorative Background Glow Elements */}
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

          <div className="relative z-10">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}
