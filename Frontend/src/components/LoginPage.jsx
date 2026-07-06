 import { Mail, Lock, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios"; // adjust the path if needed
import toast,{Toaster} from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

const LoginPage = () => {

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");


const navigate = useNavigate();
const queryClient = useQueryClient();


const registerMutation = useMutation({
  mutationFn: async (userData) => {
    const res = await axiosInstance.post("/auth/login", userData);
    return res.data;
  },

 onSuccess: async (data) => {
 
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
    toast.error(
    error.response?.data?.message || "Login failed"
  );
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
    password
  });
};



  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#edf6ff] via-[#e8f1fb] to-[#d8e8fb]">

      {/* Decorative blobs */}
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-sky-400/40 blur-3xl"></div>
      <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-blue-400/30 blur-3xl"></div>

      {/* Top-right wave */}
      <div className="absolute top-0 right-0 h-[300px] w-[260px] rounded-bl-[120px] bg-sky-300/20"></div>

      {/* Logo */}
      <div className="pt-10 flex justify-center">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-3xl">
            🛡️
          </div>

          <div className="leading-none">
            <h1 className="text-4xl font-black text-[#0f2d66]">
              SMART
            </h1>
            <h1 className="text-3xl font-black text-[#0f2d66]">
              BANK
            </h1>
          </div>
        </div>
      </div>

      {/* Login Card */}
      <div className="mt-10 flex justify-center px-6">
        <div className="w-full max-w-xl rounded-[34px] border border-cyan-300/60 bg-white/35 p-10 shadow-2xl backdrop-blur-xl">

        
          <p className="mt-3 font-bold text-center text-2xl text-slate-700">
            Sign in to your account.
          </p>

           <form onSubmit={handleSignUp}>

          {/* Email */}
          <div className="mt-10 flex items-center rounded-full bg-white/60 px-6 py-4 shadow-sm">
            <Mail className="text-gray-500" size={22} />
            <input
              type="email"
              placeholder="Email Address"
                 value={email}
                onChange={(e) => setEmail(e.target.value)}
              className="ml-4 w-full bg-transparent text-lg outline-none placeholder:text-gray-500"
            />
          </div>

          {/* Password */}
          <div className="mt-5 flex items-center rounded-full bg-white/60 px-6 py-4 shadow-sm">
            <Lock className="text-gray-500" size={22} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="ml-4 w-full bg-transparent text-lg outline-none placeholder:text-gray-500"
            />
          </div>

          {/* Button */}
         
          <button disabled={registerMutation.isPending}
            type='submit' className="mt-8 w-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 py-4 text-2xl font-semibold text-white shadow-lg transition hover:scale-[1.02]">
              {registerMutation.isPending
           ? "Logging In..."
           : "Logged In"}
          </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-300"></div>
            <span className="text-2xl text-slate-700">or</span>
            <div className="h-px flex-1 bg-gray-300"></div>
          </div>

          {/* Register */}
          <p className="text-center text-xl text-gray-600">
            <Link
              to="/register"
              className="hover:text-blue-600 hover:underline">
             <span className="cursor-pointer font-semibold text-blue-600">
              {" "}
               Create Account Sign Up
            </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
  


export default LoginPage
