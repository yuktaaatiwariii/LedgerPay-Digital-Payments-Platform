import { X } from "lucide-react";
import { useState } from "react";


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
