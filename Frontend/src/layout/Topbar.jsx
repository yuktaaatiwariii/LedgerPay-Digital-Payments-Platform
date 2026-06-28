import React from 'react'
import { useAuth } from "../lib/AuthContext.jsx";
import {User} from "lucide-react"

const Topbar = () => {

  const { authUser } = useAuth();

  return (
    <div>
          {/* Top Bar */}
          <div className="flex items-center justify-end bg-[#041d58] px-10 py-4">

            <div className=" flex items-center gap-2 text-white">
             
              <div className="  flex h-10 w-10 items-center justify-center rounded-full bg-teal-500">
                 <User/>   
              </div>
              Hi {authUser?.name}
            </div>
          </div>
      
    </div>
  )
}

export default Topbar ;
