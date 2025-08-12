import React from "react";
import MenuIcon from "@mui/icons-material/Menu";
// import NotificationsIcon from "@mui/icons-material/Notifications";

interface TopbarProps {
  title: string;
  onMenuClick: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ title, onMenuClick }) => (
  <header className="bg-white h-16 flex items-center justify-between px-4 sm:px-8 border-b border-gray-100 shadow-sm z-10">
    <div className="flex items-center gap-4">
      {/* Hamburger menu for mobile */}
      <button
        className="block lg:hidden text-gray-500 hover:text-[#8093EB] text-2xl focus:outline-none"
        onClick={onMenuClick}
        aria-label="Open sidebar"
      >
        <MenuIcon fontSize="inherit" />
      </button>

      <span className="text-xl font-semibold text-gray-800">{title}</span>
    </div>
    <div className="flex items-center gap-6">
      <div className="i-solar:user-circle-bold size-8">
        <span>A</span>
      </div>
      {/* <div
        className="ml-0 font-bold text-lg  tracking-wide"
       
      >
        Papa Yaw
      </div> */}

      {/* <button className="text-gray-400 hover:text-[#8093EB] text-2xl">
           <div className="i-solar:point-on-map-perspective-bold-duotone size-5"></div>
      </button>
      <button className="text-gray-400 hover:text-[#8093EB] text-2xl">
          <div className="i-solar:point-on-map-perspective-bold-duotone size-5"></div>
      </button> */}
    </div>
  </header>
);

export default Topbar;
