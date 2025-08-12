import React from "react";
import logo from "../assets/images/logo.png";
import { Link, useLocation } from "react-router-dom";

interface NavLink {
  label: string;
  icon: React.ReactNode;
  to?: string;
}

const navLinks: NavLink[] = [
  {
    label: "Dashboard",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="#D35400"
          strokeWidth="2"
          fill="#D35400"
        />
        <path
          d="M9 12l2 2 4-4"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
    to: "/admin/adminpage",
  },
  {
    label: "Inbox",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <rect x="3" y="7" width="18" height="13" rx="2" stroke="#888" />
        <path d="M3 7l9 6 9-6" stroke="#888" />
      </svg>
    ),
    to: "/admin/inbox",
  },
  {
    label: "Pricing",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="#888" />
        <path d="M8 9h8M8 15h8M8 12h8" stroke="#888" />
      </svg>
    ),
    to: "/admin/pricing",
  },
];

const pageLinks: NavLink[] = [
  {
    label: "Calender",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="#888"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
    to: "/admin/calendar",
  },
  {
    label: "To-Do",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="#888"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M9 12h6M9 16h6M9 8h6" />
      </svg>
    ),
    to: "#",
  },
  {
    label: "Invoice",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="#888"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h8" />
      </svg>
    ),
    to: "#",
  },
];


interface SidebarProps {
  closeSidebar?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ closeSidebar }) => {
  const location = useLocation();
  const isActive = (to?: string) => !!to && location.pathname.startsWith(to) && to !== "#";

  return (
    <aside className="bg-white h-screen w-64 flex flex-col border-r border-gray-100 shadow-sm">
      {/* Logo and close button */}
      <div className="flex flex-col items-center h-24 justify-center border-b border-gray-100 py-4 relative">
        <img src={logo} alt="mistra Logo" className="h-12 w-auto mb-2" />
        {closeSidebar && (
          <button
            className="absolute right-4 top-4 block lg:hidden text-gray-400 hover:text-orange-500 text-2xl"
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
                  ? "bg-[#D35400] text-white shadow font-semibold"
                  : "text-gray-700 hover:bg-orange-50"
              }`}
            >
              <span className="text-lg flex items-center">{link.icon}</span>
              {link.label}
            </Link>
          ) : (
            <button
              key={link.label}
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-orange-50 text-left w-full"
            >
              <span className="text-lg flex items-center">{link.icon}</span>
              {link.label}
            </button>
          )
        )}
        <div className="mt-8 mb-2 text-xs text-gray-400 font-semibold px-4 tracking-widest">
          PAGES
        </div>
        {pageLinks.map((link) =>
          link.to ? (
            <Link
              key={link.label}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium transition-all text-left w-full ${
                isActive(link.to)
                  ? "bg-[#D35400] text-white shadow font-semibold"
                  : "text-gray-700 hover:bg-orange-50"
              }`}
            >
              <span className="text-lg flex items-center">{link.icon}</span>
              {link.label}
            </Link>
          ) : (
            <button
              key={link.label}
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-orange-50 text-left w-full"
            >
              <span className="text-lg flex items-center">{link.icon}</span>
              {link.label}
            </button>
          )
        )}
      </nav>
      {/* Settings/Logout */}
      <div className="px-4 py-6 mt-auto flex flex-col gap-2 border-t border-gray-100">
        <button className="flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium text-gray-500 hover:bg-orange-50 text-left w-full">
          <span className="text-lg flex items-center">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="#888"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </span>
          Settings
        </button>
        <button className="flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium text-gray-500 hover:bg-orange-50 text-left w-full">
          <span className="text-lg flex items-center">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="#888"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M6 19a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7l5 5v9a2 2 0 0 1-2 2H6z" />
              <path d="M9 17v-2a2 2 0 0 1 2-2h4" />
            </svg>
          </span>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
