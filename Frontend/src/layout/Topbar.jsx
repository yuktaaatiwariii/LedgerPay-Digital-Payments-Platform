import React from 'react';
import { useAuth } from "../lib/AuthContext.jsx";
import { User, Search, Bell, ChevronDown, Menu, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Topbar = ({ setIsSidebarOpen }) => {
  const { authUser } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-20 bg-[#0A192F] border-b border-slate-700/50 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10">
      
      {/* Search Bar & Hamburger */}
      <div className="flex-1 max-w-xl flex items-center gap-3">
         {setIsSidebarOpen && (
           <button 
             className="md:hidden text-slate-400 hover:text-white transition p-1"
             onClick={() => setIsSidebarOpen(true)}
           >
             <Menu size={24} />
           </button>
         )}
         <button 
           className="text-slate-400 hover:text-white transition p-1"
           onClick={() => navigate(-1)}
           title="Go Back"
         >
           <ArrowLeft size={24} />
         </button>

      </div>

      {/* Right Side Items */}
      <div className="flex items-center gap-6">
         
         {/* Notifications */}
         <button className="relative text-slate-400 hover:text-white transition">
           <Bell size={22} />
           <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-[#0A192F] rounded-full"></span>
         </button>

         {/* Profile */}
         <div className="flex items-center gap-3 cursor-pointer pl-4 border-l border-slate-700">
            <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white shadow-md">
               {authUser?.name ? authUser.name.charAt(0).toUpperCase() : <User size={20} />}
            </div>
            <div className="hidden sm:flex flex-col">
               <div className="flex items-center gap-1">
                 <p className="text-sm font-bold text-white leading-tight">Hi, {authUser?.name}</p>
                 <ChevronDown size={14} className="text-slate-400" />
               </div>
               <p className="text-[10px] text-slate-400 font-medium">Customer</p>
            </div>
         </div>

      </div>
    </header>
  );
}

export default Topbar;
