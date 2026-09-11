import React from 'react'
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  CreditCard,
  LogOut,
  ShieldCheck,
  Landmark
} from "lucide-react";
import { useAuth } from "../lib/AuthContext.jsx";
import { axiosInstance } from "../lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const menu = [
  { icon: LayoutDashboard, name: "Dashboard" , route:"/home/dashboard"},
  { icon: Wallet, name: "My Accounts" , route:"/home/accounts" },
  { icon: ArrowRightLeft, name: "Transactions", route:"/home/transaction" },
  { icon: CreditCard, name: "Payment History" , route:"/home/accounts" },
];

const Sidebar = () => {
  const { authUser } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
      queryClient.setQueryData(["authUser"], null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      toast.success("Logout successfully!");
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <aside className="w-[280px] bg-[#0A192F] text-white flex flex-col hidden md:flex fixed h-full z-20">
      
      {/* Logo */}
      <div className="p-6 flex items-center gap-3 mb-4">
        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/30">
          <Landmark size={24} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-wider leading-tight">SMART BANK</h1>
          <p className="text-[10px] text-slate-400 font-medium">Ledger Based Banking System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.includes(item.route);
          return (
            <Link
              key={item.name}   
              to={item.route}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${isActive ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}

        {authUser?.role === "ADMIN" && (
          <Link
            to="/admindashboard"
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-slate-400 hover:text-white hover:bg-white/5`}
          >
            <ShieldCheck size={20} />
            <span className="text-sm font-medium">Admin Dashboard</span>
          </Link>
        )}
      </nav>

      {/* Bottom Area */}
      <div className="p-6 mt-auto space-y-4">
        
        {/* Secure Banking Widget */}
        <div className="bg-gradient-to-br from-[#112240] to-[#0A192F] border border-slate-700/50 rounded-2xl p-4 shadow-lg relative overflow-hidden">
           <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-600/20 rounded-full blur-2xl"></div>
           <div className="bg-blue-600/20 w-8 h-8 rounded-lg flex items-center justify-center mb-3">
             <ShieldCheck size={18} className="text-blue-400" />
           </div>
           <h3 className="font-bold text-sm text-white mb-1 relative z-10">Secure Banking</h3>
           <p className="text-[10px] text-slate-400 font-medium relative z-10">Your money. Our priority.</p>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-slate-400 border border-slate-700/50 hover:text-white hover:bg-white/5"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>

      </div>
    </aside>
  );
};

export default Sidebar;
