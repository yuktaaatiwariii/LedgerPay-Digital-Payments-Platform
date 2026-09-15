import  { useState } from 'react';
import Sidebar from "../layout/Sidebar.jsx";
import Topbar from "../layout/Topbar.jsx"
import { Outlet } from "react-router-dom";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F5F7FA] font-sans">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 flex flex-col min-h-screen md:ml-[280px] w-full min-w-0">
        <Topbar setIsSidebarOpen={setIsSidebarOpen} />
        <div className="flex-1 overflow-y-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

