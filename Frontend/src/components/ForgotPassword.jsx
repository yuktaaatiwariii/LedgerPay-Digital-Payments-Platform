import { useState } from "react";
import { Mail, ArrowLeft, ShieldCheck, ArrowRightLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import pic from "../public/pic.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post("/auth/forgot-password", data);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Reset link sent!");
      setEmail("");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to send reset link");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    forgotPasswordMutation.mutate({ email });
  };

  return (
    <div className="flex min-h-screen w-full bg-[#0A192F]">
      
      {/* Left Side: Branding & Image (Hidden on smaller screens) */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 bg-gradient-to-b from-[#0A192F] to-[#0F172A] relative overflow-hidden text-white">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl shadow-lg">
            🛡️
          </div>
          <div className="leading-none">
            <h1 className="text-2xl font-black tracking-wider">SMART</h1>
            <h1 className="text-xl font-black text-blue-400">BANK</h1>
          </div>
        </div>

        <div className="relative z-10 max-w-lg mt-10">
          <h2 className="text-5xl font-extrabold leading-tight mb-6">
            Account Recovery
          </h2>
          <img className="w-full h-auto rounded-2xl shadow-2xl border border-white/10 mb-10 object-cover opacity-90 hover:opacity-100 transition-opacity" src={pic} alt="Smart Bank Interface" />
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-lg font-medium text-slate-300">
              <ShieldCheck className="text-blue-400" size={24} />
              Bank-grade Security Protocols
            </div>
            <div className="flex items-center gap-3 text-lg font-medium text-slate-300">
              <ArrowRightLeft className="text-blue-400" size={24} />
              Zero-fee Instant Transfers
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-slate-500 mt-auto">
          © 2026 Smart Bank. All rights reserved.
        </div>
      </div>

      {/* Right Side: Form Component */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-white">
        <div className="w-full max-w-md py-6 sm:py-10">
          
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="flex lg:hidden items-center gap-3 mb-10 justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl shadow-lg">
              🛡️
            </div>
            <div className="leading-none">
              <h1 className="text-3xl font-black text-[#0A192F] tracking-wider">SMART</h1>
              <h1 className="text-2xl font-black text-blue-600">BANK</h1>
            </div>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-[#0F172A] mb-2">Forgot Password</h2>
            <p className="text-slate-500 text-lg">Enter your email and we'll send you a secure link to reset your password.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <div className="flex items-center bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Mail className="text-slate-400" size={20} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full ml-3 bg-transparent text-[#0F172A] outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              disabled={forgotPasswordMutation.isPending}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 rounded-xl shadow-md transition-all hover:shadow-lg disabled:opacity-70 disabled:hover:shadow-md"
            >
              {forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Link"}
            </button>
            
          </form>

          <div className="mt-8 pt-8 border-t border-slate-200 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 font-bold text-blue-600 hover:text-blue-800 transition">
              <ArrowLeft size={18} />
              Back to Login
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
