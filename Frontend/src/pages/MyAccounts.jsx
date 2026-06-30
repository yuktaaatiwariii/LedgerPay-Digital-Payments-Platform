import React from "react";
import { Search, Wallet, CreditCard, Mail, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import axios from "axios";
import { useAuth } from "../lib/AuthContext.jsx";
import { useState } from "react";

export default function MyAccounts() {

  const { authUser } = useAuth();

  const [balances, setBalances] = useState({});

  const [showHistory, setShowHistory] = useState(false);
const [transactions, setTransactions] = useState([]);
const [loadingHistory, setLoadingHistory] = useState(false);


 const handleBalance = async (accountId) => {
   try {
  const res = await axiosInstance.get(`/accounts/balance/${accountId}`);
 
  setBalances((prev) => ({
    ...prev,
    [accountId]: res.data.balance,
  }));

   setTimeout(() => {
    setBalances((prev) => {
      const copy = { ...prev };
      delete copy[accountId];
      return copy;
    });
  }, 5000);
} catch(err){
  console.error(err);
}};


const handleTransactionHistory = async (accountId) => {
  try {
    setLoadingHistory(true);

    const res = await axiosInstance.get(
      `/transactions/history/${accountId}`
    );

    setTransactions(res.data.transactions);
    setShowHistory(true);

  } catch (err) {
    console.error(err);
  } finally {
    setLoadingHistory(false);
  }
};


const { data: accountsData, isLoading } = useQuery({
  queryKey: ["accounts"],
  queryFn: async () => {
    const res = await axiosInstance.get("/accounts/");
    return res.data;
  },
});
const accounts = accountsData?.accounts || [];



if (isLoading) {
  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-xl text-teal-600">Loading Accounts...</p>
    </div>
  );
}

  return (
    <div className="h-full p-6 w-240 ">

      {/* Heading */}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-5xl font-bold text-gray-800">
            My Accounts
          </h1>

          <p className="text-gray-500 mt-2">
            Manage all your bank accounts in one place.
          </p>
        </div>
      </div>

         {/* Important Info */}

     <div className="flex gap-20">
           <div className="flex  ">
             <CreditCard className="text-cyan-300 mr-2" />
                  <p className="text-sm font-bold text-gray-900">
                    Customer ID :
                  </p>

                  <p className="font-semibold ml-2 text-cyan-600">
                {authUser?.customerId}
                  </p>
                </div>

                <div className="flex ">
                  <User className="text-cyan-300 mr-2" />
                  <p className="text-sm font-bold text-gray-900">
                    Customer Name :
                  </p>

                  <p className="font-semibold ml-2 text-cyan-600">
                  {authUser?.name?.charAt(0).toUpperCase() + authUser?.name?.slice(1)}
                  </p>
                </div>

       <div className="flex">
                     <Mail className="text-cyan-300 mr-2" />
                  <p className="text-sm font-bold text-gray-900">
                    Email :
                  </p>

                  <p className="font-semibold ml-2 text-cyan-600">
                    {authUser?.email}
                  </p>
                </div>
     </div>


      {/* Cards */}

      <div className=" mt-7 w-200 grid grid-cols-1 lg:grid-cols-2 gap-4">

        {accounts.map((account) => (
          <div
            key={account._id}
            className="bg-white rounded-3xl shadow-md p-6 hover:shadow-xl transition"
          >

            {/* Header */}

                <h2 className="text-2xl font-bold text-cyan-600">
                  {account.type} ACCOUNT
                </h2>

                <p className="text-gray-400 mt-1">
                  Active Account
                </p>


            {/* Info */}

              <div className="flex items-center mt-8 space-y-5 gap-3">

                <CreditCard className="text-cyan-300" />

                <div>
                  <p className="text-sm font-semibold">
                    Account Number
                  </p>

                  <p className="text-sm text-gray-400">
                    {account._id}
                  </p>
                </div>

              </div>

            {/* Buttons */}

           <div className="mt-6">

    <div className="flex items-center gap-5">

        <button
            onClick={() => handleBalance(account._id)}
            className="rounded-xl bg-cyan-600 px-5 py-3 text-white font-semibold hover:bg-cyan-800 transition"
        >
            Check Balance
        </button>

           {balances[account._id] !== undefined && (
              <div className="ml-4 bg-green-100 text-green-700 px-4 py-2 rounded-xl">
              ₹ {balances[account._id]}
                </div>
                  ) }
    </div>

     <button
    onClick={() => handleTransactionHistory(account._id)}
    className="mt-5 rounded-xl border border-cyan-600 px-5 py-3 text-cyan-600 font-semibold hover:bg-cyan-50 transition"
>
    Transaction History
     </button>
      </div>
  </div>
  ))}
</div>

     {showHistory && (
  <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

    <div className="bg-white w-[500px] max-h-[60vh] shadow-2xl rounded-3xl p-8">

      <div className="flex justify-between items-center mb-5">

        <h2 className="text-2xl font-bold text-cyan-700">
          Transaction History
        </h2>

        <button
          onClick={() => setShowHistory(false)}
          className="text-2xl font-bold text-gray-500 hover:text-red-500"
        >
          ✕
        </button>

      </div>

      {/* Body */}

      <div className="max-h-[350px] overflow-y-auto">

        {loadingHistory ? (

          <p className="text-center text-gray-500 py-10">
            Loading...
          </p>

        ) : transactions.length === 0 ? (

          <p className="text-center text-gray-500 py-10">
            No Transactions Found
          </p>

        ) : (

          <div className="space-y-4">

            {transactions.map((tx, index) => (

              <div
                key={tx._id || index}
                className={`rounded-2xl p-5 border ${
                  tx.direction === "CREDIT"
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >

                <div className="flex justify-between">

                  <div className="flex ">

                    <h3
                      className={`font-bold text-lg mr-3 ${
                        tx.direction === "CREDIT"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {tx.direction}
                    </h3>

                    <p className="text-gray-500 text-sm mt-1">
                      {new Date(tx.createdAt).toLocaleString()}
                    </p>

                  </div>

                  <div
                    className={`font-bold text-xl ${
                      tx.direction === "CREDIT"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {tx.direction === "CREDIT" ? "+" : "-"} ₹{tx.amount}
                  </div>

                </div>

                <div className="mt-4 text-sm text-gray-600">

                  <p>
                    <span className="font-semibold">From:</span>{" "}
                    {tx.fromAccount
                      ? `${tx.fromAccount.type} (${tx.fromAccount._id})`
                         : "-"}
                  </p>

                  <p>
                    <span className="font-semibold">To:</span>{" "}
                      {tx.toAccount
                      ? `${tx.toAccount.type} (${tx.toAccount._id})`
                       : "-"}
                  </p>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  </div>
)}




</div>
  )}; 