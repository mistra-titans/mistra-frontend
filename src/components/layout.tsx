import React, { useState } from "react";
import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import AdminTopbar from "./Topbar";

const SIDEBAR_WIDTH = 256; // 64 * 4 (w-64)
const TOPBAR_HEIGHT = 64; // 16 * 4 (h-16)

interface AdminLayoutProps {
  title: string;
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ title, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      {/* Fixed Sidebar (desktop) & Drawer (mobile) */}
      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed top-0 left-0 h-screen w-64 z-30">
        <Sidebar />
      </div>
      {/* Mobile sidebar drawer */}
      <div
        className={`lg:hidden fixed top-0 left-0 h-screen w-64 z-40 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ willChange: "transform" }}
      >
        <Sidebar closeSidebar={closeSidebar} />
      </div>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30  bg-opacity-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}
      {/* Fixed Topbar */}
      <div className="fixed top-0 left-0 lg:left-64 right-0 h-16 z-20">
        <AdminTopbar
          title={title}
          onMenuClick={() => setSidebarOpen((v) => !v)}
        />
      </div>
      {/* Main Content */}
      <main
        className="min-h-screen"
        style={{
          marginLeft: window.innerWidth >= 1024 ? SIDEBAR_WIDTH : 0,
          paddingTop: TOPBAR_HEIGHT,
        }}
      >
        <div className="p-4 sm:p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
