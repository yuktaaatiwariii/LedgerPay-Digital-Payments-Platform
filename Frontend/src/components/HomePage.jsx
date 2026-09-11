
import Sidebar from "../layout/Sidebar.jsx";
import Topbar from "../layout/Topbar.jsx"
import { Outlet } from "react-router-dom";





export default function Home() {
  return (
    <div className="flex min-h-screen bg-[#F5F7FA] font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen md:ml-[280px]">
        <Topbar />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

