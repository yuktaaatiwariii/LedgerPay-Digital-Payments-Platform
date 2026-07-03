import React from 'react'
import {
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  CreditCard,
  Search,
  Bell,
  User,
  PlusCircle,
  ExternalLink,
  Send,
  ArrowUpRight,
  Landmark,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../lib/AuthContext.jsx";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";



export default function DashboardPage() {

  const navigate = useNavigate();
const { authUser } = useAuth();

const { data: accountsData, isLoading } = useQuery({
  queryKey: ["accounts"],
  queryFn: async () => {
    const res = await axiosInstance.get("/accounts/");
    return res.data;
  },
});

const totalAccounts = accountsData?.accounts?.length || 0;

const { data: summaryData, isLoading: summaryLoading } = useQuery({
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


  return (
    <>
     
            <div className=" w-240 h-full flex">
              {/* left */}
              <div className="  ">

                <h1 className="text-5xl pt-15 pl-10 font-bold">
                  Welcome back, {authUser?.name}
                </h1>

                <p className="mt-5 pl-10 text-lg text-cyan-600">
                  Your dashboard is secure and up-to-date.
                </p>


                <div className="mt-3 pl-10 w-90 space-y-2">
                 <p className="text-lg text-black">
                   Customer ID:
                 <span className="font-semibold text-cyan-600 ml-2">
                    {authUser?.customerId}
                  </span>
                        </p>

                       <p className="text-lg text-black">
                        Last Login:
                             <span className="font-semibold text-cyan-600 ml-2">
                        {authUser?.previousLogin
                               ? new Date(
                            authUser.previousLogin
                                ).toLocaleString()
                            : "First Login"}
                            </span>
                              </p>
                           </div>


                {/* Quick actions */}
                <div className=" pl-10 gap-2 mt-10 ">

                  <ActionCard
                    icon={<PlusCircle />}
                    title="Create Account"
                    route="/home/create"
                  />

                  <ActionCard
                    icon={<Send />}
                    title="Send Money"
                    route="/home/transaction"
                  />

                  <ActionCard
                    icon={<Wallet />}
                    title="Check Balance"
                    route="/home/accounts"
                  />

                </div>   

            
           <p className="mb-2 ml-38 text-s mt-25  text-black">
             Every transaction secured. Every customer valued.
               </p> </div>


           <div className="ml-20">
            {/* right */}

          <div
           onClick={() => navigate("/home/accounts")} 
           className="rounded-3xl h-48 bg-white p-5 mt-15 shadow  ">

             <div className="flex items-center gap-3">
             <ExternalLink
               size={30}
               className="text-cyan-500  w-20 h-20 p-2 rounded-xl bg-teal-100" />
            <div>
             <h3 className="text-xl  font-semibold text-gray-700">
                Total Accounts
               </h3>
                <div className="mt-2 text-6xl font-bold text-cyan-600">
             {isLoading ? "...." : totalAccounts}
             </div> </div>
             </div>
             <div className="mt-2 h-1 rounded bg-cyan-400"></div>
            <div className=" h-12 rounded bg-gradient-to-b from-teal-100 to-transparent"></div>
            </div>
          

               <SummaryCard
                 totalBalance={totalBalance}
                    totalCredit={totalCredit}
                    totalDebit={totalDebit}
                   totalTransactions={totalTransactions}
                loading={summaryLoading}
              />
             </div>

              </div>
              </>
  )
}

function ActionCard({ icon, title , route}) {
    const navigate = useNavigate();
  return (
    <div 
     onClick={() => navigate(route)}
    className="rounded-2xl mt-5 flex bg-white p-5 text-center shadow transition hover:-translate-y-1">
      <div className="mb-3 flex  justify-center  text-cyan-600">
        {icon}
      </div>

      <p className="font-medium ml-4">{title}</p>
      <ArrowUpRight className='ml-60 text-cyan-600 '/>
    </div>
  );
}

function SummaryCard({
  totalBalance,
  totalCredit,
  totalDebit,
  totalTransactions,
  loading,
}) {
  if (loading) {
    return (
      <div className="rounded-3xl bg-white mt-4 p-6 shadow">
        Loading...
      </div>
    );
  }

  return (
    <div className="rounded-3xl mt-10 bg-white p-6 shadow w-80">

      <h2 className="text-2xl font-bold text-cyan-600 mb-5">
        Monthly Summary
      </h2>

      <div className="space-y-4">

        <div className="flex justify-between">
          <span>Total Balance</span>
          <span className="font-bold text-teal-600">
            ₹ {totalBalance}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Total Credit</span>
          <span className="font-bold text-green-500">
            + ₹ {totalCredit}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Total Debit</span>
          <span className="font-bold text-red-500">
            - ₹ {totalDebit}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Total Transactions</span>
          <span className="font-bold">
            {totalTransactions}
          </span>
        </div>

      </div>

         <div className=" mt-3 h-1 rounded bg-cyan-400"></div>
    </div>
  );
}