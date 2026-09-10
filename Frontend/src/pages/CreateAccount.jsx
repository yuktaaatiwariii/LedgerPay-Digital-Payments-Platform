import  { useState } from "react";
import { User, Mail, CreditCard, Wallet, Landmark } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";



export default function CreateAccount() {
  const { authUser } = useAuth();
  const queryClient = useQueryClient();
const navigate = useNavigate();


const createAccountMutation = useMutation({
  mutationFn: async (data) => {
    const res = await axiosInstance.post("/accounts", {
     data,
    });

    return res.data;
  },

  onSuccess: () => {

    toast.success("Account Created Successfully 🎉");

    // Refresh account list
    queryClient.invalidateQueries({
      queryKey: ["accounts"],
    });

    // Redirect
    navigate("/home/accounts");
  },

  onError: (error) => {
    toast.error(
      error.response?.data?.message || "Failed to create account"
    );
  },
});




  const [formData, setFormData] = useState({
    type: "SAVING",
  });

  const { data: accountsData } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const res = await axiosInstance.get("/accounts/");
      return res.data;
    },
  });

  const totalAccounts = accountsData?.accounts?.length || 0;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(formData);
createAccountMutation.mutate(formData.type);
   
  };

  return (
    <>
    <div className="flex  p-4">

      <div className="">
        {/* Heading */}

      <h1 className="text-5xl pl-8 font-bold text-gray-800">
        Create New Account
      </h1>

      <p className="text-gray-500 mt-3 pl-8">
        Open a new account under  your existing customer profile.
      </p>
      </div>

      
          {/* Info */}

          <div className="bg-cyan-50 rounded-2xl mx-10  p-5">

            <div className="flex items-center gap-3 mb-3">

              <Landmark className="text-cyan-600" />

              <h3 className="font-bold text-cyan-700">
                Account Information
              </h3>

            </div>

            <ul className="space-y-2 text-gray-700 text-sm">

              <li>✔ Status : ACTIVE</li>

              <li>✔ Account Number will be generated automatically.</li>

              <li>
                ✔ Account will be linked to your existing Customer ID.
              </li>

            </ul>

          </div>

</div>
      {/* Main */}

      <div className="mt-3 grid grid-cols-2 gap-4 pl-4 ">

        {/* Left */}

        <div className=" h-max bg-white rounded-3xl shadow-lg mx-8 p-8 max-w-100">

          <h2 className="text-2xl font-bold text-cyan-700 mb-8">
            Customer Information
          </h2>

          <div className="space-y-3">

            <div className="flex items-center gap-4">
              <User className="text-cyan-600" />
              <div>
                <p className="text-sm text-gray-500">
                  Customer Name
                </p>

                <p className="font-semibold">
                  {authUser?.name?.charAt(0).toUpperCase() +
                    authUser?.name?.slice(1)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
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

            <div className="flex items-center gap-4">

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

            <div className="flex items-center gap-4">

              <Wallet className="text-cyan-600" />

              <div>

                <p className="text-sm text-gray-500">
                  Existing Accounts
                </p>

                <p className="font-semibold">
                  {totalAccounts}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* Right */}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-lg p-8 max-w-100"
        >

          <h2 className="text-2xl font-bold text-cyan-700 mb-6">
            Account Details
          </h2>

          {/* Account Type */}

          <div className="mb-2">

            <label className="font-semibold">
              Account Type
            </label>
            <br/>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className=" w-70 mt-2 rounded-xl border p-2 focus:ring-2 focus:ring-cyan-500 outline-none"
            >
              <option value="SAVING">Saving Account</option>
              <option value="SALARY">Salary Account</option>
              <option value="CURRENT">Current Account</option>
              <option value="FIXED-DEPOSITE">
                Fixed Deposit
              </option>
            </select>

          </div>

          {/* Currency */}

          <div className="mb-6">

            <label className="font-semibold">
              Currency
            </label>
              <br/>
            <input
              value="INR (Indian Rupee)"
              readOnly
              className="w-70 mt-2 rounded-xl border bg-gray-100 p-2"
            />

          </div>

          {/* Buttons */}

          <div className="flex  gap-4">

            <button
              type="button"
              className="px-6  rounded-xl border border-cyan-600 text-cyan-600 hover:bg-cyan-50"
            >
              Cancel
            </button>

            <button
                type="submit"
                     disabled={createAccountMutation.isPending}
              className="px-8 py-2 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-700"
            >
              {createAccountMutation.isPending
              ? "Creating..."
                : "Create Account"}
            </button>

          </div>

        </form>

      </div>

    
    </>
  )}
