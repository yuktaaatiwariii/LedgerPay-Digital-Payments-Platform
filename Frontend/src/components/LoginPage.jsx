import { Mail, Lock, Eye, EyeOff, ShieldCheck,  Sun, Moon, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import pic from "../public/house.png";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const registerMutation = useMutation({
    mutationFn: async (userData) => {
      const res = await axiosInstance.post("/auth/login", userData);
      return res.data;
    },
    onSuccess: async (data) => {
      localStorage.setItem("accessToken", data.accessToken);
      toast.success("Login successfully!");

      await queryClient.invalidateQueries({
        queryKey: ["authUser"],
      });

      if (data.user.role === "ADMIN") {
        navigate("/admindashboard");
      } else {
        navigate("/home/dashboard");
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Login failed");
    },
  });

  const handleSignUp = (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    registerMutation.mutate({
      email,
      password,
    });
  };

  return (
    <div className="flex min-h-screen w-full font-sans">
      
      {/* Left Side: Branding & Image (Hidden on smaller screens) */}
      <div className="hidden lg:flex w-[45%] flex-col justify-between p-12 bg-[#0a1128] relative overflow-hidden text-white">
        
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

        {/* Logo Section */}
        <div className="relative z-10 flex items-center gap-4 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
            <ShieldCheck size={28} strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <h1 className="text-xl font-bold tracking-wider">SMART BANK</h1>
            <p className="text-xs text-blue-300 font-medium">Ledger Based Banking System</p>
          </div>
        </div>

        <div className="relative z-10 max-w-lg mt-8">
          <h2 className="text-[2.5rem] font-bold leading-[1.1] mb-6">
            Secure Banking <br/> for a Smarter <br/> <span className="text-blue-500">Tomorrow</span>
          </h2>
          <p className="text-slate-400 text-sm mb-12 leading-relaxed max-w-md">
            Experience modern, secure and transparent <br/> banking with our ledger-based system.
          </p>
        </div>

        {/* 3D Illustration Placeholder */}
        <div className="relative z-10 mt-auto flex justify-center">
             <img className="w-full max-w-md h-auto object-contain mx-auto mix-blend-screen opacity-90 drop-shadow-2xl" src={pic} alt="Smart Bank Interface" />
        </div>
      </div>

      {/* Right Side: Form Component */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-4 sm:p-8 bg-slate-50 relative">
        
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4 sm:top-8 sm:right-8 flex items-center bg-slate-200/80 rounded-full p-1 border border-slate-300/50">
           <button onClick={() => setIsDarkMode(false)} className={`p-1.5 rounded-full transition ${!isDarkMode ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
              <Sun size={18} />
           </button>
           <button onClick={() => setIsDarkMode(true)} className={`p-1.5 rounded-full transition ${isDarkMode ? 'bg-[#0F172A] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Moon size={18} />
           </button>
        </div>

        <div className="w-full max-w-[420px] bg-white p-6 sm:p-10 rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-100">
          
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-[#0F172A] mb-2">Welcome Back</h2>
            <p className="text-slate-500 text-sm">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-6">
            
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">Email Address</label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                <Mail className="text-slate-400" size={20} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full ml-3 bg-transparent text-[#0F172A] outline-none placeholder:text-slate-400 text-sm font-medium"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">Password</label>
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                <div className="flex items-center w-full">
                  <Lock className="text-slate-400" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full ml-3 bg-transparent text-[#0F172A] outline-none placeholder:text-slate-400 text-sm font-medium"
                  />
                </div>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600 transition ml-2">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all" />
                    </div>
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition">
                  Forgot Password?
                </Link>
            </div>

            <button
              disabled={registerMutation.isPending}
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base py-3.5 rounded-xl shadow-lg shadow-blue-600/25 transition-all hover:shadow-blue-600/40 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:shadow-md disabled:hover:translate-y-0 mt-8"
            >
              {registerMutation.isPending ? "Authenticating..." : <> <ArrowRight size={18}/> Login</>}
            </button>
            
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm font-medium">
              New to Smart Bank? <br/>
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-800 transition mt-2 inline-block">
                Create an Account
              </Link>
            </p>
          </div>
          
        </div>
        
        <div className="absolute bottom-8 text-xs font-medium text-slate-400">
           © 2026 Smart Bank. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
