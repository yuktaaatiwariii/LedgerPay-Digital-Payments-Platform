import React from 'react'
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  CreditCard,
  Search,
  Bell,
  User,
  PlusCircle,
  Send,
  Landmark,
  LogOut
} from "lucide-react";
import { useAuth } from "../lib/AuthContext.jsx";
import { axiosInstance } from "../lib/axios";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";



const menu = [
  { icon: LayoutDashboard, name: "Dashboard" , route:"/home/dashboard"},
  { icon: Wallet, name: "My Accounts" , route:"/home/accounts" },
  { icon: ArrowRightLeft, name: "Transactions", route:"/home/transaction" },
  { icon: CreditCard, name: "Payment History" , route:"/home/accounts" },
];

const Sidebar = () => {

const queryClient = useQueryClient();
const navigate = useNavigate();

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
    <div className='min-h-112 bg-gradient-to-b from-[#021d57] to-[#03204b]'>
         {/* Sidebar */}
        <aside className="  p-6 text-white">

          <div className="mb-2 mx-5 flex items-center gap-5">
            <div className="rounded-xl bg-cyan-500 p-3">
              <Landmark size={30} />
            </div>

            <div>
              <h2 className="font-bold text-4xl leading-none">SMART</h2>
              <h2 className="font-bold text-3xl leading-none">BANK</h2>
            </div>
          </div>

          

          <nav className="space-y-3 mt-10 ">
            {menu.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}   
                   to={item.route}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-cyan-500/20 border border-cyan-400 hover:text-cyan-300
                  " >
             <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}

         <button
            onClick={handleLogout}
              className="flex align-bottom items-center gap-2 mt-62 rounded-lg bg-cyan-500 px-4 py-2 text-white transition hover:bg-blue-500">
               <LogOut size={18} />
                     Logout
        </button>


          </nav>
        </aside>
    </div>
  )
}

export default Sidebar
