import React, { useState } from "react";
import {
  Users,
  Wallet,
  ShieldCheck, TrendingUp, ArrowLeftRight, Activity
} from "lucide-react";
import { axiosInstance } from "../lib/axios";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UsersModal, AccountsModal, FundsModal} from "../pages/AdminModals.jsx";



export default function AdminDashboard() {

  const queryClient = useQueryClient();

  // -----------------------------
  // Modal States
  // -----------------------------
  const [showUsers, setShowUsers] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);
  const [showFunds, setShowFunds] = useState(false);


  // -----------------------------
  // Users
  // -----------------------------
  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axiosInstance.get("/transactions/viewAllUsers");
      return res.data;
    },
  });

  // -----------------------------
  // Accounts
  // -----------------------------
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


  // -----------------------------
  // Initial Fund Transfer
  // -----------------------------
  const initialFundMutation = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(
        "/transactions/system/initial-funds",
        data
      );
      return res.data;
    },

    onSuccess: (data) => {
      toast.success(data.message);

      queryClient.invalidateQueries({
        queryKey: ["allAccounts"],
      });

      setShowFunds(false);
    },

    onError: (err) => {
      toast.error(
        err.response?.data?.message || "Transfer Failed"
      );
    },
  });


  const navigate = useNavigate();

const logoutMutation = useMutation({
  mutationFn: async () => {
    const res = await axiosInstance.post("/auth/logout");
    return res.data;
  },

  onSuccess: (data) => {
  
    toast.success("Logged out successfully");

    queryClient.setQueryData(["authUser"], null);

    navigate("/login");
  },

  onError: (err) => {
    toast.error(
      err.response?.data?.message || "Logout failed"
    );
  },
});

  return (
     <div className="h-max  flex items-center bg-gray-200 justify-center ">
    <div className="min-h-screen m-20 sketch-lg rounded-3xl bg-gray-100 p-10">

      {/* Heading */}
        <div className=" flex justify-between items-center ">
      <div className="mb-8">
        <h1 className="text-5xl font-bold text-gray-800">
          Admin Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          Manage customers, accounts and banking operations.
        </p>
      </div>

        <div className="flex items-center gap-4">

      <div className="flex bg-cyan-600 text-white px-6 py-3 rounded-2xl shadow-lg items-center gap-2">
        <ShieldCheck size={20} />
        <span className="font-semibold">
         Administrator
        </span>
        </div>

        <button
           onClick={() => logoutMutation.mutate()}
             disabled={logoutMutation.isPending}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-2xl shadow-lg transition" >
    <LogOut size={18} />

          {logoutMutation.isPending
               ? "Logging out..."
                : "Logout"}
             </button>

            </div> </div>
        

           {/* Statistics */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white rounded-3xl shadow-md p-7 hover:shadow-xl transition">

          <div className="flex justify-between items-center">

            <div>
              <p className="text-gray-500">
                Total Users
              </p>

              <h2 className="text-4xl font-bold text-cyan-700 mt-2">
                {totalUsers}
              </h2>
            </div>

            <div className="bg-cyan-100 p-4 rounded-2xl">
              <Users className="text-cyan-700" size={35} />
            </div>

          </div>

        </div>

        <div className="bg-white rounded-3xl shadow-md p-7 hover:shadow-xl transition">

          <div className="flex justify-between items-center">

            <div>

              <p className="text-gray-500">
                Total Accounts
              </p>

              <h2 className="text-4xl font-bold text-green-600 mt-2">
                {totalAccounts}
              </h2>

            </div>

            <div className="bg-green-100 p-4 rounded-2xl">
              <Wallet className="text-green-600" size={35} />
            </div>

          </div>

        </div>

        <div className="bg-white rounded-3xl shadow-md p-7 hover:shadow-xl transition">

          <div className="flex justify-between items-center">

            <div>

              <p className="text-gray-500">
                Initial Fund Transfers
              </p>

              <h2 className="text-4xl font-bold text-cyan-600 mt-2">
                Ready
              </h2>

            </div>

            <div className="bg-cyan-100 p-4 rounded-2xl">
              <TrendingUp className="text-cyan-600" size={35} />
            </div>

          </div>

        </div>

      </div>


    
      {/* Quick Actions */}

      <div className="mt-10">

        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Initial Funds */}

          <div className="bg-white rounded-3xl shadow-md p-8 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 cursor-pointer">

            <div className="bg-cyan-100 w-16 h-16 rounded-2xl flex items-center justify-center">

              <ArrowLeftRight
                className="text-cyan-700"
                size={32}
              />

            </div>

            <p className="text-gray-500 mt-3">
              Deposit opening balance into newly created accounts.
            </p>

            <button onClick={()=>setShowFunds(true)} className="mt-7 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl font-semibold">
              Open
            </button>

          </div>

          {/* Users */}

          <div className="bg-white rounded-3xl shadow-md p-8 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 cursor-pointer">

            <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center">

              <Users
                className="text-green-700"
                size={32}
              />

            </div>

            <p className="text-gray-500 mt-3">
              View all registered users and customer information.
            </p>

            <button onClick={()=>setShowUsers(true)} className="mt-7 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold">
              Open
            </button>

          </div> 

          {/* Accounts */}

          <div className="bg-white rounded-3xl shadow-md p-8  hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 cursor-pointer ">

            <div className="bg-cyan-200 w-16 h-16 rounded-2xl flex items-center justify-center">

              <Activity
                className="text-cyan-700"
                size={32}
              />

            </div>

            <p className="text-gray-500 mt-3">
              View every account in the banking system.
            </p>

            <button onClick={()=>setShowAccounts(true)} className="mt-7 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl font-semibold">
              Open
            </button>

          </div>
       

        </div>

      </div>

  </div> 

   <UsersModal
open={showUsers}
onClose={() => setShowUsers(false)}
users={usersData?.users || []}
/>

<AccountsModal
open={showAccounts}
onClose={() => setShowAccounts(false)}
accounts={accountsData?.accounts}
/>

<FundsModal
open={showFunds}
onClose={() => setShowFunds(false)}
mutation={initialFundMutation}
accounts={accounts}
/>


</div>

  )
          }



