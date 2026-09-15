import React, { useState } from "react";
import {
  Users, Wallet, ShieldCheck, ArrowLeftRight, Activity,
  LayoutDashboard, Clock,  Settings as
  Search, Bell,  ArrowUpRight, ArrowDownRight,  ArrowRight, Menu, ArrowLeft
} from "lucide-react";
import { axiosInstance } from "../lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { UsersModal, AccountsModal, FundsModal, UserSearchModal } from "../pages/AdminModals.jsx";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Modal States
  const [showUsers, setShowUsers] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);
  const [showFunds, setShowFunds] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Data Queries
  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axiosInstance.get("/transactions/viewAllUsers");
      return res.data;
    },
  });

  const { data: accountsData } = useQuery({
    queryKey: ["allAccounts"],
    queryFn: async () => {
      const res = await axiosInstance.get("/transactions/getAllAccounts");
      return res.data;
    },
  });

  const users = usersData?.users || [];
  const accounts = accountsData?.accounts || [];
  const totalUsers = users.length;
  const totalAccounts = accounts.length;

  // Search Logic
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSearchUser, setSelectedSearchUser] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const filteredSearchUsers = searchQuery.trim() ? users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.customerId?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const initialFundMutation = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post("/transactions/system/initial-funds", data);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["allAccounts"] });
      setShowFunds(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Transfer Failed");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post("/auth/logout");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Logged out successfully");
      queryClient.setQueryData(["authUser"], null);
      navigate("/login");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Logout failed");
    },
  });

  const sidebarMenu = [
    { name: "Dashboard", icon: LayoutDashboard, active: true },
    { name: "Users", icon: Users, onClick: () => setShowUsers(true) },
    { name: "Accounts", icon: Wallet, onClick: () => setShowAccounts(true) },
    { name: "User Dashboard", icon: LayoutDashboard, onClick: () => navigate("/home/dashboard") },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-[280px] bg-[#0A192F] text-white flex flex-col fixed h-full z-30 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 flex items-center gap-3 mb-4">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/30">
            <ShieldCheck size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wider leading-tight">SMART BANK</h1>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {sidebarMenu.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                item.onClick();
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${item.active ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <item.icon size={20} />
              <span className="text-sm font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <ShieldCheck size={24} className="mx-auto text-blue-400 mb-2" />
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              Secure • Reliable • Transparent<br/>
              <span className="text-white mt-1 block text-xs">Smart Bank</span>
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-0 md:ml-[280px] flex flex-col min-h-screen relative">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10">
          <div className="flex-1 max-w-xl relative flex items-center gap-3">
             <button 
               className="md:hidden text-slate-400 hover:text-slate-600 transition p-1"
               onClick={() => setIsSidebarOpen(true)}
             >
               <Menu size={24} />
             </button>
             <button 
               className="text-slate-400 hover:text-slate-600 transition p-1"
               onClick={() => navigate(-1)}
               title="Go Back"
             >
               <ArrowLeft size={24} />
             </button>
             <div className="relative flex items-center w-full max-w-md bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 focus-within:bg-white transition-all hidden sm:flex">
                <Search size={18} className="text-slate-400 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  className="w-full bg-transparent ml-3 outline-none text-sm text-slate-700 placeholder:text-slate-400 font-medium" 
                />
             </div>
             
             {/* Search Dropdown */}
             {isSearchOpen && searchQuery.trim() && (
               <div className="absolute top-14 left-0 w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
                 {filteredSearchUsers.length > 0 ? (
                   <div className="p-2 space-y-1">
                     {filteredSearchUsers.map(u => (
                       <div 
                         key={u._id} 
                         onClick={() => {
                           setSelectedSearchUser(u);
                           setIsSearchOpen(false);
                           setSearchQuery("");
                         }}
                         className="p-3 hover:bg-slate-50 rounded-lg cursor-pointer flex justify-between items-center transition"
                       >
                         <div>
                           <p className="text-sm font-bold text-slate-800">{u.name}</p>
                           <p className="text-xs text-slate-500 font-medium">{u.email}</p>
                         </div>
                         <div className="flex items-center gap-2">
                           <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600">{u.role}</span>
                           <ArrowRight size={14} className="text-slate-400" />
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="p-6 text-center text-slate-500 text-sm font-medium">No users found matching "{searchQuery}"</div>
                 )}
               </div>
             )}
          </div>
          <div className="flex items-center gap-6">
             <button className="relative text-slate-400 hover:text-slate-600 transition">
               <Bell size={22} />
               <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
             </button>
             <div className="flex items-center gap-3 cursor-pointer pl-4 border-l border-slate-200" onClick={() => logoutMutation.mutate()}>
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-600/20">
                   A
                </div>
                <div className="hidden sm:block">
                   <p className="text-sm font-bold text-slate-800 leading-tight">Admin</p>
                   <p className="text-xs text-slate-500 font-medium">Administrator</p>
                </div>
             </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 max-w-7xl mx-auto w-full flex-1">
          
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight">Admin Dashboard</h1>
              <p className="text-slate-500 mt-1 text-sm font-medium">Manage customers, accounts and banking operations.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm text-sm font-medium text-slate-600 flex items-center gap-2 cursor-pointer hover:border-slate-300 transition">
                 <Clock size={16} className="text-slate-400"/>
                 {formattedDate} • {formattedTime}
                 <ArrowDownRight size={14} className="ml-2 text-slate-400"/>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 relative overflow-hidden group hover:shadow-md transition">
               <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                 <Users size={28} strokeWidth={2}/>
               </div>
               <div>
                 <p className="text-sm font-semibold text-slate-500 mb-1">Total Users</p>
                 <h3 className="text-3xl font-bold text-slate-800">{totalUsers}</h3>
                 <p className="text-xs font-bold text-emerald-500 flex items-center gap-1 mt-1">
                    <ArrowUpRight size={14} strokeWidth={3}/> 12% <span className="text-slate-400 font-medium ml-1">vs. last month</span>
                 </p>
               </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 relative overflow-hidden group hover:shadow-md transition">
               <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                 <Wallet size={28} strokeWidth={2}/>
               </div>
               <div>
                 <p className="text-sm font-semibold text-slate-500 mb-1">Total Accounts</p>
                 <h3 className="text-3xl font-bold text-slate-800">{totalAccounts}</h3>
                 <p className="text-xs font-bold text-emerald-500 flex items-center gap-1 mt-1">
                    <ArrowUpRight size={14} strokeWidth={3}/> 9% <span className="text-slate-400 font-medium ml-1">vs. last month</span>
                 </p>
               </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 relative overflow-hidden group hover:shadow-md transition">
               <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                 <ArrowLeftRight size={28} strokeWidth={2}/>
               </div>
               <div>
                 <p className="text-sm font-semibold text-slate-500 mb-1">Initial Fund Transfers</p>
                 <h3 className="text-3xl font-bold text-indigo-600">Ready</h3>
                 <p className="text-xs font-bold text-emerald-500 flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> System Active
                 </p>
               </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[
                 { title: "Initial Funds", desc: "Deposit opening balance into newly created accounts.", icon: ArrowLeftRight, color: "text-cyan-600", bg: "bg-cyan-50", onClick: () => setShowFunds(true) },
                 { title: "Users", desc: "View all registered users and customer information.", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50", onClick: () => setShowUsers(true) },
                 { title: "Accounts", desc: "View every account in the banking system.", icon: Activity, color: "text-indigo-600", bg: "bg-indigo-50", onClick: () => setShowAccounts(true) },
               ].map((action, idx) => (
                 <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-md transition-all">
                    <div className={`w-14 h-14 rounded-2xl ${action.bg} ${action.color} flex items-center justify-center mb-5`}>
                       <action.icon size={26} strokeWidth={2}/>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">{action.title}</h3>
                    <p className="text-sm text-slate-500 mb-6 leading-relaxed font-medium px-2">{action.desc}</p>
                    <button onClick={action.onClick} className="mt-auto w-full bg-[#0A192F] hover:bg-blue-600 text-white text-sm font-bold py-3 rounded-xl transition-colors shadow-sm">
                      Open
                    </button>
                 </div>
               ))}
            </div>
          </div>

          {/* Bottom Area: Chart & List (Placeholders to match mockup) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart Placeholder */}
            <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                 <div>
                   <h2 className="font-bold text-slate-800 text-lg">Transaction Overview</h2>
                   <p className="text-xs text-slate-500 font-medium">Last 7 days</p>
                 </div>
                 <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
                    <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-sm">7D</button>
                    <button className="px-3 py-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg text-xs font-bold transition">30D</button>
                    <button className="px-3 py-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg text-xs font-bold transition">90D</button>
                 </div>
              </div>
              <div className="flex-1 min-h-[200px] border-b border-l border-slate-100 relative mb-4 flex items-end pt-4">
                 {/* Simple SVG Chart Representation */}
                 <svg className="w-full h-[180px] text-blue-500 drop-shadow-md overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <path d="M0,35 C10,30 20,33 30,22 C40,15 50,22 60,18 C70,12 80,18 90,10 L100,5" fill="none" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M0,35 C10,30 20,33 30,22 C40,15 50,22 60,18 C70,12 80,18 90,10 L100,5 L100,40 L0,40 Z" fill="url(#gradient)" opacity="0.2" />
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <circle cx="0" cy="35" r="1.5" fill="currentColor" stroke="white" strokeWidth="0.5"/>
                    <circle cx="30" cy="22" r="1.5" fill="currentColor" stroke="white" strokeWidth="0.5"/>
                    <circle cx="60" cy="18" r="1.5" fill="currentColor" stroke="white" strokeWidth="0.5"/>
                    <circle cx="90" cy="10" r="1.5" fill="currentColor" stroke="white" strokeWidth="0.5"/>
                 </svg>
                 {/* Y Axis labels placeholder */}
                 <div className="absolute top-0 -left-6 h-full flex flex-col justify-between text-[10px] text-slate-400 font-medium py-1">
                    <span>40k</span>
                    <span>30k</span>
                    <span>20k</span>
                    <span>10k</span>
                    <span>0</span>
                 </div>
                 {/* X Axis labels placeholder */}
                 <div className="absolute -bottom-6 left-0 w-full flex justify-between text-[10px] text-slate-400 font-medium px-2">
                    <span>Jun 3</span>
                    <span>Jun 4</span>
                    <span>Jun 5</span>
                    <span>Jun 6</span>
                    <span>Jun 7</span>
                    <span>Jun 8</span>
                    <span>Jun 9</span>
                 </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-6">
                 <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
                   <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><ArrowUpRight size={14} strokeWidth={2.5}/></div>
                   <div><p className="font-bold text-sm text-slate-800 leading-tight">₹ 1,24,532</p><p className="text-[10px] text-slate-500 font-medium mt-0.5">Total Inflow</p></div>
                 </div>
                 <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
                   <div className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0"><ArrowDownRight size={14} strokeWidth={2.5}/></div>
                   <div><p className="font-bold text-sm text-slate-800 leading-tight">₹ 98,320</p><p className="text-[10px] text-slate-500 font-medium mt-0.5">Total Outflow</p></div>
                 </div>
                 <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
                   <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><Activity size={14} strokeWidth={2.5}/></div>
                   <div><p className="font-bold text-sm text-slate-800 leading-tight">₹ 26,212</p><p className="text-[10px] text-slate-500 font-medium mt-0.5">Net Balance</p></div>
                 </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      <UsersModal open={showUsers} onClose={() => setShowUsers(false)} users={usersData?.users || []} />
      <AccountsModal open={showAccounts} onClose={() => setShowAccounts(false)} accounts={accountsData?.accounts} />
      <FundsModal open={showFunds} onClose={() => setShowFunds(false)} mutation={initialFundMutation} accounts={accounts} />
      
      <UserSearchModal 
        open={!!selectedSearchUser} 
        onClose={() => setSelectedSearchUser(null)} 
        user={selectedSearchUser} 
        accounts={accounts} 
      />
    </div>
  );
}
