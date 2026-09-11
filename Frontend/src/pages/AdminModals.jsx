import { X } from "lucide-react";
import { useState } from "react";
import { axiosInstance } from "../lib/axios";


// =============================
// Users Modal
// =============================

export function UsersModal({ open, onClose, users }) {

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-3xl w-[900px] max-h-[80vh] overflow-y-auto p-8">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">All Users</h2>

          <button onClick={onClose}>
            <X />
          </button>
        </div>


        <table className="w-full">

          <thead className="bg-cyan-100">

            <tr>

              <th className="p-3 text-left">Name</th>

              <th className="p-3 text-left">Email</th>

              <th className="p-3 text-left">Customer ID</th>

              <th className="p-3 text-left">Role</th>

            </tr>

          </thead>

          <tbody>

            {users?.map((user) => (

              <tr
                key={user._id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-3">{user.name}</td>

                <td className="p-3">{user.email}</td>

                <td className="p-3">{user.customerId}</td>

                <td className="p-3">{user.role}</td>

              </tr>

            ))}

          </tbody>

        </table>
    

      </div>
    </div>
  );
}



// =============================
// Accounts Modal
// =============================

export function AccountsModal({
  open,
  onClose,
  accounts,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

      <div className="bg-white rounded-3xl w-[950px] max-h-[80vh] overflow-y-auto p-8">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-3xl font-bold">
            All Accounts
          </h2>

          <button onClick={onClose}>
            <X />
          </button>

        </div>

        <table className="w-full">

          <thead className="bg-cyan-100">

            <tr>

              <th className="p-3 text-left">
                Account ID
              </th>

              <th className="p-3 text-left">
                Holder
              </th>

              <th className="p-3 text-left">
                Email
              </th>

              <th className="p-3 text-left">
                Type
              </th>

              <th className="p-3 text-left">
                Status
              </th>

            </tr>

          </thead>

          <tbody>

            {accounts?.map((account) => (

              <tr
                key={account._id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-3">
                  {account._id}
                </td>

                <td className="p-3">
                  {account.user?.name}
                </td>

                <td className="p-3">
                  {account.user?.email}
                </td>

                <td className="p-3">
                  {account.type}
                </td>

                <td className="p-3">
                  {account.status}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}



// =============================
// Initial Funds Modal
// =============================

import { useEffect } from "react";
import { RefreshCw, IndianRupee, Landmark } from "lucide-react";

export function FundsModal({
  open,
  onClose,
  mutation,
  accounts,
}) {
  const [formData, setFormData] = useState({
    toAccount: "",
    amount: "",
    idempotencyKey: crypto.randomUUID(),
  });

  useEffect(() => {
    if (open) {
      setFormData({
        toAccount: "",
        amount: "",
        idempotencyKey: crypto.randomUUID(),
      });
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.toAccount) {
      return alert("Select an account");
    }

    if (Number(formData.amount) <= 0) {
      return alert("Enter valid amount");
    }

    mutation.mutate({
      toAccount: formData.toAccount,
      amount: Number(formData.amount),
      idempotencyKey: formData.idempotencyKey,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

      <div className="bg-white rounded-3xl w-[650px] p-8">

        <div className="flex justify-between items-center mb-8">

          <h2 className="text-3xl font-bold text-cyan-700">
            Initial Fund Transfer
          </h2>

          <button
            onClick={onClose}
            className="text-2xl"
          >
            ✕
          </button>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* Account */}

          <div>

            <label className="font-semibold">
              Select Account
            </label>

            <select
              value={formData.toAccount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  toAccount: e.target.value,
                })
              }
              className="w-full border rounded-xl p-3 mt-2"
            >
              <option value="">
                Select Account
              </option>

              {accounts.map((account) => (
                <option
                  key={account._id}
                  value={account._id}
                >
                  {account.user.name} • {account.type} • {account._id}
                </option>
              ))}
            </select>

          </div>

          {/* Amount */}

          <div>

            <label className="font-semibold">
              Amount
            </label>

            <div className="relative mt-2">

              <IndianRupee
                size={18}
                className="absolute left-3 top-3.5 text-gray-400"
              />

              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: e.target.value,
                  })
                }
                className="w-full border rounded-xl p-3 pl-10"
                placeholder="Enter Amount"
              />

            </div>

          </div>

          {/* UUID */}

          <div>

            <label className="font-semibold">
              Idempotency Key
            </label>

            <div className="flex gap-3 mt-2">

              <input
                readOnly
                value={formData.idempotencyKey}
                className="flex-1 border rounded-xl p-3 bg-gray-100"
              />

              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    idempotencyKey:
                      crypto.randomUUID(),
                  })
                }
                className="bg-cyan-600 text-white px-4 rounded-xl"
              >
                <RefreshCw size={18} />
              </button>

            </div>

          </div>

          <div className="flex justify-end gap-4 pt-4">

            <button
              type="button"
              onClick={onClose}
              className="border border-cyan-600 px-6 py-2 rounded-xl text-cyan-700"
            >
              Cancel
            </button>

            <button
              disabled={mutation.isPending}
              className="bg-cyan-600 text-white px-8 py-2 rounded-xl hover:bg-cyan-700"
            >
              {mutation.isPending
                ? "Processing..."
                : "Transfer Funds"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

// =============================
// User Search Modal
// =============================

export function UserSearchModal({ open, onClose, user, accounts }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user && accounts?.length > 0) {
      setLoading(true);
      const fetchTransactions = async () => {
        try {
          const userAccounts = accounts.filter(acc => acc.user?._id === user._id);
          const allTx = [];
          for (const acc of userAccounts) {
            const res = await axiosInstance.get(`/transactions/history/${acc._id}`);
            if (res.data.transactions) {
              allTx.push(...res.data.transactions);
            }
          }
          // Sort by date descending
          allTx.sort((a, b) => new Date(b.date) - new Date(a.date));
          setTransactions(allTx);
        } catch (err) {
          console.error("Error fetching transactions", err);
        } finally {
          setLoading(false);
        }
      };
      fetchTransactions();
    }
  }, [open, user, accounts]);

  if (!open || !user) return null;

  const userAccounts = accounts?.filter(acc => acc.user?._id === user._id) || [];

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{user.name}</h2>
            <p className="text-slate-500 font-medium text-sm mt-1">{user.email} • ID: {user.customerId}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white">
          
          {/* User Accounts */}
          <div>
             <h3 className="text-lg font-bold text-slate-800 mb-4">User Accounts ({userAccounts.length})</h3>
             {userAccounts.length === 0 ? (
               <p className="text-slate-500 text-sm">No accounts found for this user.</p>
             ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {userAccounts.map(acc => (
                   <div key={acc._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                      <p className="text-xs font-bold text-blue-600 mb-1">{acc.type} Account</p>
                      <p className="font-mono text-sm text-slate-800 font-medium">{acc._id}</p>
                      <p className={`text-xs font-bold mt-2 ${acc.status === 'Active' ? 'text-emerald-500' : 'text-slate-400'}`}>{acc.status}</p>
                   </div>
                 ))}
               </div>
             )}
          </div>

          {/* Transactions */}
          <div>
             <h3 className="text-lg font-bold text-slate-800 mb-4">Transaction History</h3>
             {loading ? (
               <p className="text-slate-500 text-sm animate-pulse">Loading transactions...</p>
             ) : transactions.length === 0 ? (
               <p className="text-slate-500 text-sm">No transactions found.</p>
             ) : (
               <div className="space-y-3">
                 {transactions.map((tx, idx) => {
                   const isCredit = userAccounts.some(acc => acc._id === tx.toAccount?._id);
                   return (
                     <div key={idx} className="flex justify-between items-center p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition bg-white">
                       <div>
                         <p className="text-sm font-bold text-slate-800">{tx.type}</p>
                         <p className="text-xs text-slate-500 font-medium mt-0.5">{new Date(tx.date).toLocaleString()}</p>
                       </div>
                       <div className="text-right">
                         <p className={`text-sm font-bold ${isCredit ? 'text-emerald-500' : 'text-red-500'}`}>
                           {isCredit ? '+' : '-'} ₹ {tx.amount}
                         </p>
                         <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 mt-1 inline-block">{tx.status}</span>
                       </div>
                     </div>
                   );
                 })}
               </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
}
