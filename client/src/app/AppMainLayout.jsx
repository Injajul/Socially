import React, { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/home/Sidebar";

export default function AppMainLayout() {

const [isSidebarOpen, setIsSidebarOpen] = useState(true);


  return (
    <div className="flex flex-col    min-h-screen bg-[#111827] text-gray-100 overflow-hidden">
      

      {/* Body */}
      <div className="flex flex-1 ">
        {/* Sidebar */}
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        {/* Main area */}
        <main
          className={`flex-1 transition-all duration-300 ${
            isSidebarOpen ? "ml-0 lg:ml-64" : "ml-0 lg:ml-20"
          } pt-16 lg:pt-0`} // Add padding-top for mobile to avoid overlap with header
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
