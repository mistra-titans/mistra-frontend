import React from "react";
import logo from "../assets/images/logo.png";
import { Link, useLocation } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PaymentIcon from "@mui/icons-material/Payment";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

interface NavLink {
  label: string;
  icon: React.ReactNode;
  to?: string;
}

const navLinks: NavLink[] = [
  {
    label: "Home",
    icon: <div className="i-solar:home-angle-2-bold-duotone size-5"></div>,
    to: "/home",
  },
  {
    label: "Activity",
    icon: <div className="i-solar:point-on-map-perspective-bold-duotone size-5"></div>,
    to: "/activity",
  },
  {
    label: "Payment",
    icon: <div className="i-solar:card-bold-duotone size-5"></div>,
    to: "/payment",
  },
  {
    label: "Transactions",
    icon: <div className="i-solar:card-transfer-bold-duotone size-5"></div>,
    to: "/transactions",
  },
];

interface SidebarProps {
  closeSidebar?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ closeSidebar }) => {
  const location = useLocation();
  const isActive = (to?: string) =>
    !!to && location.pathname.startsWith(to) && to !== "#";

  return (
    <aside className="bg-white h-screen w-64 flex flex-col border-r border-gray-100 shadow-sm">
      {/* Logo and close button */}
      <div className="flex flex-col items-center h-24 justify-center border-b border-gray-100 py-4 relative">
        <img src={logo} alt="mistra Logo" className="h-12 w-auto mb-2" />
        {closeSidebar && (
          <button
            className="absolute right-4 top-4 block lg:hidden text-gray-400 hover:text-[#8093EB] text-2xl"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            &times;
          </button>
        )}
      </div>
      {/* Navigation (scrollable area) */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">
        {navLinks.map((link) =>
          link.to ? (
            <Link
              key={link.label}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium transition-all text-left w-full ${
                isActive(link.to)
                  ? "bg-[#8093EB] text-white shadow font-semibold"
                  : "text-gray-700 hover:bg-[#8093EB]/10"
              }`}
            >
              <span className="text-lg flex items-center">{link.icon}</span>
              {link.label}
            </Link>
          ) : (
            <button
              key={link.label}
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-[#8093EB]/10 text-left w-full"
            >
              <span className="text-lg flex items-center">{link.icon}</span>
              {link.label}
            </button>
          )
        )}
      </nav>
      {/* Settings/Logout */}
      <div className="px-4 py-6 mt-auto flex flex-col gap-2 border-t border-gray-100">
        <button className="flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium text-gray-500 hover:bg-[#8093EB]/10 text-left w-full">
          <span className="text-lg flex items-center">
            <SettingsIcon fontSize="small" />
          </span>
          Settings
        </button>
        <button className="flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium text-gray-500 hover:bg-[#8093EB]/10 text-left w-full">
          <span className="text-lg flex items-center">
            <LogoutIcon fontSize="small" />
          </span>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
