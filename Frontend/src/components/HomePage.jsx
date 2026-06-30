
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../layout/Sidebar.jsx";
import Topbar from "../layout/Topbar.jsx"
import { Outlet } from "react-router-dom";





export default function Home() {
  return (
    <>
    <div className="h-max border-black flex items-center justify-center bg-gray-100 p-6">
      <div className=" h-max flex max-w-7xl  overflow-hidden rounded-3xl bg-white shadow ">

     <Sidebar/>


   {/* Main */}

    <main className="flex-1 bg-[#f8f8fb]">
       <Topbar />
          <div className="p-6">
            <Outlet />
          </div>
      </main>

      </div>
       
    </div>
       <div className="text-gray-500 text-center">
            © 2025 Smart Bank
          </div>  
    </>
  );
}

