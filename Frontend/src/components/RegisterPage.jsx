import {
  User,
  Mail,
  Lock,
  EyeOff,
  ShieldCheck,
  Bell,
  ArrowRightLeft,
} from "lucide-react";
import pic from "../public/pic.png"
import {Link} from "react-router-dom"
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios"; // adjust the path if needed
import toast,{Toaster} from "react-hot-toast";


const RegisterPage = () => {

const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");


const navigate = useNavigate();

// from here we navigatee on success

const registerMutation = useMutation({
  mutationFn: async (userData) => {
    const res = await axiosInstance.post("/auth/register", userData);
    return res.data;
  },

  onSuccess: (data) => {
      toast.success("Account created successfully!");
 
        navigate("/login");

  },

  onError: (error) => {
    toast.error(
    error.response?.data?.message || "Registration failed"
  );
  },
});



const handleSignUp = (e) => {
  e.preventDefault();

   if (!name || !email || !password) {
    toast.error("Please fill in all fields.");
    return;
  }

  registerMutation.mutate({
    name,
    email,
    password,
  });
};

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#edf6ff] via-[#e7f1fb] to-[#d6eaff]">

      {/* Decorative blobs */}
      <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-sky-400/40 blur-3xl" />
      <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-blue-500/30 blur-3xl" />
      <div className="absolute right-0 top-0 h-[500px] w-[300px] rounded-bl-[150px] bg-sky-300/20" />

      {/* Logo */}
      <div className="pt-8 flex justify-center">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-3xl text-white font-bold">
            🛡️
          </div>

          <div className="leading-none">
            <h1 className="text-5xl font-black text-[#0c2b66]">
              SMART
            </h1>
            <h1 className="text-4xl font-black text-[#0c2b66]">
              BANK
            </h1>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto mt-12 grid max-w-7xl grid-cols-1 items-center gap-16 px-8 lg:grid-cols-2">

        {/* Left Side */}
        <div>

          <h2 className="text-center text-5xl font-extrabold text-[#0d2b63] lg:text-left">
            Join the Smart <br/>  Bank Family
          </h2>

          {/* Illustration Placeholder */}
          <img className="h-80 w-140 my-8 rounded-3xl" src={pic} alt="bank" />
         

          {/* Bottom Features */}
          <div className="mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">

            <div className="flex items-center  text-xl text-slate-700">
              <ShieldCheck className="text-blue-600" size={22} />
              Secure Banking
            </div>

            <div className="flex items-center text-xl text-slate-700">
              <ArrowRightLeft className="text-blue-600" size={22} />
              Instant Transfers
            </div>

            <div className="flex items-center  text-xl text-slate-700">
              <Bell className="text-blue-600" size={22} />
              Real-time Alerts
            </div>

          </div>
        </div>

        {/* Right Side */}
        <div className="mx-auto w-full max-w-md rounded-[36px] border border-cyan-200/60 bg-white/40 p-8 shadow-2xl backdrop-blur-xl">

          <h2 className="text-center text-2xl font-bold text-[#12356d]">
            Register Your Account
          </h2>
         <form onSubmit={handleSignUp}>

          <div className="mt-4 space-y-5">

            <div className="flex items-center rounded-full bg-white/70 px-5 py-3 shadow-sm">
              <User className="text-gray-500" size={22} />
                
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="ml-3 w-full bg-transparent outline-none"
              />
            </div>

            <div className="flex items-center rounded-full bg-white/70 px-5 py-3 shadow-sm">
              <Mail className="text-gray-500" size={22} />

              <input
                type="email"
                placeholder="Email Address"
                className="ml-3 w-full bg-transparent outline-none"
                  value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex items-center rounded-full bg-white/70 px-5 py-3 shadow-sm">
              <Lock className="text-gray-500" size={22} />

              <input
                type="password"
                placeholder="Password"
                className="ml-3 w-full bg-transparent outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
            disabled={registerMutation.isPending}
            type='submit' className="mt-1 w-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 py-3 text-xl font-semibold text-white shadow-lg transition hover:scale-[1.02]">
            {registerMutation.isPending
           ? "Creating Account..."
           : "Create Account"}
            </button>
           
          </div>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-300" />
            <span className="text-xl text-gray-600">or</span>
            <div className="h-px flex-1 bg-gray-300" />
          </div>

          <p className="text-center text-lg text-slate-700">
            Already have an account?
              <Link to="/login"  className=" font-semibold"> 
              <span className="cursor-pointer font-semibold text-blue-600">
              {" "}
              Sign In
            </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage 