import React from "react";
import { Search, Wallet, CreditCard, Mail, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import axios from "axios";
import { useAuth } from "../lib/AuthContext.jsx";

const CreateAccount = () => {

  const { authUser } = useAuth();



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
           </div> </div>
    
  )
}

export default CreateAccount
