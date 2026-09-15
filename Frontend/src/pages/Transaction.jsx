import  { useState, useEffect } from "react";
import {
 
  CreditCard,
  Mail,
  Landmark,
  ArrowRightLeft,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "../lib/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function Transaction() {
  const { authUser } = useAuth();
  const queryClient = useQueryClient();


const transferMutation = useMutation({
  mutationFn: async (data) => {
    const res = await axiosInstance.post("/transactions", data);
    return res.data;
  },

  onSuccess: (data) => {
    toast.success(data.message);

    setFormData({
    toAccount: "",
    amount: "",
    idempotencyKey: crypto.randomUUID(),
  });

    // Refresh accounts (balance changes)
    queryClient.invalidateQueries({
      queryKey: ["accounts"],
    });

    // Refresh history
    queryClient.invalidateQueries({
      queryKey: ["transactions"],
    });

    // Generate a fresh idempotency key
    setFormData((prev) => ({
      ...prev,
      idempotencyKey: crypto.randomUUID(),
    }));
  },

  onError: (err) => {
    toast.error(
      err.response?.data?.message || "Transaction Failed"
    );
  },

 
});


const handleSubmit = (e) => {
  e.preventDefault();

  if (formData.fromAccount === formData.toAccount) {
    toast.error("From and To account cannot be the same.");
    return;
  }

if (!formData.toAccount) {
    toast.error("Please select receiver account");
    return;
}

if (!formData.fromAccount) {
  toast.error("Please select your account");
  return;
}

if (Number(formData.amount) <= 0) {
    toast.error("Amount must be greater than 0");
    return;
}

  transferMutation.mutate({
    fromAccount:  formData.fromAccount,
    toAccount: formData.toAccount,
    amount: Number(formData.amount),
    idempotencyKey: formData.idempotencyKey,
  });
};

   //usestate variables

  const [formData, setFormData] = useState({
    fromAccount: "",
    toAccount: "",
    amount: "",
    idempotencyKey: crypto.randomUUID(),
  });

  // Fetch Accounts
  
  const { data } = useQuery({
  queryKey: ["transferAccounts"],
  queryFn: async () => {
    const res = await axiosInstance.get("/transactions/transferAccounts");
    return res.data;
  },
});

const accounts = data?.accounts || [];

const myAccounts = accounts.filter(
  (account) => account.user._id === authUser._id
);

const otherAccounts = accounts.filter(
  (account) => account._id !== formData.fromAccount ,
);


  const generateKey = () => {
    setFormData({
       amount: "",
      idempotencyKey: crypto.randomUUID(),
    });
  };

  // Generate UUID automatically
  useEffect(() => { generateKey();}, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="p-4 sm:p-6 w-full max-w-5xl mx-auto">
      {/* Heading */}

      <h1 className="text-5xl font-bold text-gray-800">
        Transfer Money
      </h1>

      <p className="text-gray-500 mt-3">
        Securely transfer money between bank accounts.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

        {/* LEFT */}

        <div className="space-y-5">

          {/* Customer Card */}

          <div className="bg-white rounded-3xl shadow-lg p-7">

          

            <div className="space-y-5">
              <div className="flex gap-4">

                <CreditCard className="text-cyan-600" />

                <div>
                  <p className="text-sm text-gray-500">
                    Customer ID
                  </p>

                  <p className="font-semibold">
                    {authUser?.customerId}
                  </p>
                </div>

              </div>

              <div className="flex gap-4">

                <Mail className="text-cyan-600" />

                <div>

                  <p className="text-sm text-gray-500">
                    Email
                  </p>

                  <p className="font-semibold">
                    {authUser?.email}
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* Summary */}

          <div className="bg-cyan-50 rounded-3xl p-7">

            <div className="flex items-center gap-3">

              <Landmark className="text-cyan-700" />

              <h2 className="font-bold text-xl text-cyan-700">
                Transfer Summary
              </h2>

            </div>

            <div className="mt-6 space-y-3">

              <p>
                Amount :
                <span className="font-bold ml-2">
                  ₹ {formData.amount || 0}
                </span>
              </p>

              <p>
                Currency :
                <span className="font-bold ml-2">
                  INR
                </span>
              </p>

            </div>

          </div>

        </div>

        {/* RIGHT */}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-lg p-8"
        >

          <div className="flex items-center gap-3 mb-7">

            <ArrowRightLeft className="text-cyan-700" />

            <h2 className="text-2xl font-bold text-cyan-700">
              Transfer Details
            </h2>

          </div>

          {/* From */}

          <label className="font-semibold">
            From Account
          </label>

         <select
         name="fromAccount"
          value={formData.fromAccount}
         onChange={handleChange}
         className="w-full border rounded-xl p-3 mt-2 mb-5"
          >
      <option value="">Select Your Account</option>

  {myAccounts.map((account) => (
    <option key={account._id} value={account._id}>
      {account.type} • {account._id}
    </option>
  ))}
</select>

          {/* To */}

          <label className="font-semibold">
            To Account
          </label>

          <select
            name="toAccount"
            value={formData.toAccount}
            onChange={handleChange}
            className="w-full border rounded-xl p-3 mt-2 mb-5"
          >
            <option value="">Select Account</option>

              {otherAccounts.map((account) => (
            <option key={account._id} value={account._id}>
          {account.user.name} • {account._id}
            </option>
            ))}

          </select>

          {/* Amount */}

          <label className="font-semibold">
            Amount
          </label>

          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Enter Amount"
            className="w-full border rounded-xl p-3 mt-2 mb-5"
          />

          {/* UUID */}

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
              onClick={generateKey}
              className="bg-cyan-600 text-white rounded-xl px-4 hover:bg-cyan-700"
            >
              <RefreshCw size={18} />
            </button>

          </div>

          {/* Buttons */}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 mt-10">
            <button
              type="button"
              onClick={() =>
              setFormData({
            fromAccount: "",
            toAccount: "",
            amount: "",
            idempotencyKey: crypto.randomUUID(),
        })
    }
              className="border border-cyan-600 px-6 py-3 rounded-xl text-cyan-700 w-full sm:w-auto text-center"
            >
              Cancel
            </button>

           <button
            type="submit"
             disabled={transferMutation.isPending}
                  className="bg-cyan-600 text-white rounded-xl px-8 py-3 w-full sm:w-auto hover:bg-cyan-700 disabled:bg-gray-400">
                     {transferMutation.isPending
                    ? "Processing..."
                      : "Transfer Money"}
                </button>

          </div>

        </form>

      </div>

    </div>
  );
}