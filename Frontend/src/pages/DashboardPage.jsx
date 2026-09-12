import {
  Wallet,
  PlusCircle,
  Send,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  User,
  Calendar,
  CreditCard,

} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import houseImg from "../public/house.png";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { authUser } = useAuth();

  // Fetch Accounts
  const { data: accountsData, isLoading: accountsLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const res = await axiosInstance.get("/accounts/");
      return res.data;
    },
  });

  const accounts = accountsData?.accounts || [];
  const primaryAccount = accounts.length > 0 ? accounts[0] : null;
  const totalAccounts = accounts.length;

  // Fetch Summary
  const { data: summaryData } = useQuery({
    queryKey: ["summary"],
    queryFn: async () => {
      const res = await axiosInstance.get("/accounts/getSummary");
      return res.data;
    },
  });

  const totalBalance = summaryData?.totalBalance || 0;
  const totalCredit = summaryData?.totalCredit || 0;
  const totalDebit = summaryData?.totalDebit || 0;
  const totalTransactions = summaryData?.totalTransactions || 0;

  // Fetch Recent Transactions
  const { data: recentTransactions, isLoading: txLoading } = useQuery({
    queryKey: ["recentTransactions", accounts],
    queryFn: async () => {
      if (accounts.length === 0) return [];
      const allTx = [];
      for (const acc of accounts) {
        try {
          const res = await axiosInstance.get(`/transactions/history/${acc._id}`);
          if (res.data.transactions) {
            allTx.push(...res.data.transactions);
          }
        } catch (err) {
          console.error(err);
        }
      }
      // Sort by date descending and get top 5
      allTx.sort((a, b) => new Date(b.date) - new Date(a.date));
      return allTx.slice(0, 5);
    },
    enabled: accounts.length > 0
  });

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col xl:flex-row gap-8">
        
        {/* Left Column (Main Content) */}
        <div className="flex-1 space-y-8">
          
          {/* Welcome Banner */}
          <div className="bg-[#0A192F] rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
             <div className="absolute right-0 bottom-0 w-64 h-64 bg-blue-500/20 blur-3xl rounded-full border-pink-500 border-8"></div>
             
             <div className="relative z-10">
                <p className="text-slate-300 font-medium mb-1">Hi,</p>
                <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
                  Welcome back, {authUser?.name} <span className="text-3xl">👋</span>
                </h1>
                <p className="text-slate-400 mb-8 max-w-md">Your dashboard is secure and up-to-date.</p>
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 border border-slate-700/50 bg-white/5 rounded-lg px-3 py-1.5">
                    <User size={16} className="text-slate-400" />
                    <span className="text-slate-400">Customer ID:</span>
                    <span className="font-bold">{authUser?.customerId || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 border border-slate-700/50 bg-white/5 rounded-lg px-3 py-1.5">
                    <Calendar size={16} className="text-slate-400" />
                    <span className="text-slate-400">Last Login:</span>
                    <span className="font-bold">
                      {authUser?.previousLogin ? new Date(authUser.previousLogin).toLocaleString() : "First Login"}
                    </span>
                  </div>
                </div>
             </div>

             {/* House Graphic */}
             <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:block">
               <div className="w-56 h-56 relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl"></div>
                  <img src={houseImg} alt="Bank" className="w-full h-full object-contain drop-shadow-2xl relative z-10" />
                  <div className="absolute bottom-4 right-4 bg-blue-600 rounded-full p-2 border-4 border-[#0A192F] z-20">
                    <ShieldCheck size={28} className="text-white" />
                  </div>
               </div>
             </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <ActionCard 
               icon={<PlusCircle size={28} />} 
               title="Create Account" 
               desc="Open a new bank account in just a few steps."
               route="/home/create" 
             />
             <ActionCard 
               icon={<Send size={28} />} 
               title="Send Money" 
               desc="Transfer funds securely and instantly."
               route="/home/transaction" 
             />
             <ActionCard 
               icon={<Wallet size={28} />} 
               title="Check Balance" 
               desc="View your account balance and recent activity."
               route="/home/accounts" 
             />
          </div>

          {/* Account Overview */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800">Account Overview</h2>
              <button onClick={() => navigate('/home/accounts')} className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline">
                View All Accounts <ArrowRight size={16} />
              </button>
            </div>

            <div className="bg-[#0A192F] rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
               <div className="absolute right-0 bottom-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
               
               {primaryAccount ? (
                 <div className="relative z-10">
                   <div className="flex items-center gap-4 mb-10">
                     <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                       <Wallet size={24} className="text-white" />
                     </div>
                     <div>
                       <h3 className="font-bold text-lg">{primaryAccount.type} Account</h3>
                       <p className="text-slate-400 font-mono text-sm tracking-widest">•••• {primaryAccount._id.slice(-4)}</p>
                     </div>
                     <div className="ml-auto">
                       <div className="w-16 h-10 border-2 border-white/20 rounded-xl opacity-50 flex items-center justify-center">
                         <CreditCard size={20} />
                       </div>
                     </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div>
                       <p className="text-sm text-slate-400 font-medium mb-1">Available Balance</p>
                       <p className="text-3xl font-bold">₹ {primaryAccount.balance?.toLocaleString() || "0.00"}</p>
                     </div>
                     <div>
                       <p className="text-sm text-slate-400 font-medium mb-1">Total Credit</p>
                       <p className="text-lg font-bold text-emerald-400 flex items-center gap-1">
                         <ArrowUpRight size={16} /> ₹ {totalCredit.toLocaleString()}
                       </p>
                     </div>
                     <div>
                       <p className="text-sm text-slate-400 font-medium mb-1">Total Debit</p>
                       <p className="text-lg font-bold text-red-400 flex items-center gap-1">
                         <ArrowDownRight size={16} /> ₹ {totalDebit.toLocaleString()}
                       </p>
                     </div>
                   </div>
                 </div>
               ) : (
                 <div className="relative z-10 py-8 text-center">
                   <p className="text-slate-400 mb-4">You don't have any accounts yet.</p>
                   <button onClick={() => navigate('/home/create')} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">Create Account</button>
                 </div>
               )}
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                 <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                   <ShieldCheck size={20} />
                 </div>
                 <div>
                   <p className="font-bold text-sm text-slate-800">Bank-grade Security</p>
                   <p className="text-xs text-slate-500 mt-0.5">Your data is protected</p>
                 </div>
              </div>
              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                 <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                   <Zap size={20} />
                 </div>
                 <div>
                   <p className="font-bold text-sm text-slate-800">Zero-fee Transfers</p>
                   <p className="text-xs text-slate-500 mt-0.5">Fast & secure</p>
                 </div>
              </div>
              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                 <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                   <Lock size={20} />
                 </div>
                 <div>
                   <p className="font-bold text-sm text-slate-800">Ledger Based System</p>
                   <p className="text-xs text-slate-500 mt-0.5">Transparent & Reliable</p>
                 </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column (Sidebar Widgets) */}
        <div className="w-full xl:w-[400px] space-y-6">
           
           {/* Total Accounts Widget */}
           <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
             <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 flex items-center justify-center">
               <TrendingUp size={32} className="text-blue-300 ml-4 mt-4" />
             </div>
             <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                 <Wallet size={20} />
               </div>
               <h3 className="font-bold text-slate-800">Total Accounts</h3>
             </div>
             <p className="text-5xl font-bold text-[#0A192F] mb-2">{accountsLoading ? "-" : totalAccounts}</p>
             <p className="text-xs font-bold text-emerald-500 flex items-center gap-1"><ArrowUpRight size={14} /> +0% <span className="text-slate-400 font-medium">vs. last month</span></p>
           </div>

           {/* Monthly Summary Widget */}
           <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
             <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                 <TrendingUp size={20} />
               </div>
               <h3 className="font-bold text-slate-800">Monthly Summary</h3>
             </div>
             
             <div className="space-y-4">
               <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                 <span className="text-sm font-bold text-slate-600">Total Balance</span>
                 <span className="font-bold text-slate-800">₹ {totalBalance.toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                 <span className="text-sm font-bold text-slate-600">Total Credit</span>
                 <span className="font-bold text-emerald-500">+ ₹ {totalCredit.toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                 <span className="text-sm font-bold text-slate-600">Total Debit</span>
                 <span className="font-bold text-red-500">- ₹ {totalDebit.toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center pb-4">
                 <span className="text-sm font-bold text-slate-600">Total Transactions</span>
                 <span className="font-bold text-slate-800">{totalTransactions}</span>
               </div>
               <div className="h-1.5 w-full bg-blue-100 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500 w-full"></div>
               </div>
             </div>
           </div>

           {/* Recent Transactions Widget */}
           <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
             <div className="flex items-center justify-between mb-6">
               <h3 className="font-bold text-slate-800">Recent Transactions</h3>
               <button onClick={() => navigate('/home/transaction')} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                 View All <ArrowRight size={12} />
               </button>
             </div>
             
             {txLoading ? (
               <div className="text-center py-8 text-slate-500 text-sm animate-pulse">Loading transactions...</div>
             ) : recentTransactions && recentTransactions.length > 0 ? (
               <div className="space-y-4">
                 {recentTransactions.map((tx, idx) => {
                   const isCredit = accounts.some(acc => acc._id === tx.toAccount?._id);
                   return (
                     <div key={idx} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition cursor-pointer">
                       <div className="flex items-center gap-3">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCredit ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                           {isCredit ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                         </div>
                         <div>
                           <p className="text-sm font-bold text-slate-800">{tx.type}</p>
                           <p className="text-[10px] text-slate-500 font-medium mt-0.5">{new Date(tx.date).toLocaleString()}</p>
                         </div>
                       </div>
                       <div className="text-right">
                         <p className={`text-sm font-bold ${isCredit ? 'text-emerald-500' : 'text-red-500'}`}>
                           {isCredit ? '+' : '-'} ₹ {tx.amount.toLocaleString()}
                         </p>
                         <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 mt-1 inline-block">Completed</span>
                       </div>
                     </div>
                   );
                 })}
               </div>
             ) : (
               <div className="text-center py-8 text-slate-500 text-sm bg-slate-50 rounded-2xl">
                 No recent transactions found.
               </div>
             )}
           </div>

        </div>

      </div>
    </div>
  );
}

// Subcomponents
function ActionCard({ icon, title, desc, route }) {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(route)}
      className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 cursor-pointer group hover:-translate-y-1 hover:shadow-md transition-all duration-300"
    >
      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-bold text-slate-800 text-lg mb-2">{title}</h3>
      <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">{desc}</p>
      
      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center ml-auto group-hover:bg-blue-600 group-hover:text-white transition-colors">
        <ArrowRight size={16} />
      </div>
    </div>
  );
}