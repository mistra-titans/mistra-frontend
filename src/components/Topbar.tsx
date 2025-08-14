import React from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "../contexts/use-auth";

interface TopbarProps {
  title: string;
  onMenuClick: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ title, onMenuClick }) => {
  const { user } = useAuth();
  
  // Handle loading and error states for user name
  const getUserDisplayName = () => {
   
    if (user.isLoading) return "Loading...";
    if (user.error || !user.data.data) return "User";
    
    return user.data.data.first_name && user.data.data.last_name
      ? `${user.data.data.first_name} ${user.data.data.last_name}`
      : user.data.data.first_name || user.data.data.email || "User";
  };

  return (
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
      
      <div className="flex items-center gap-3">
        <div className="i-solar:user-circle-bold size-8 text-gray-600"></div>
        
        <div className="font-medium text-gray-800">
          {getUserDisplayName()}
        </div>

        {/* Uncomment these if you want the additional buttons */}
        {/* <button className="text-gray-400 hover:text-[#8093EB] text-2xl">
           <div className="i-solar:point-on-map-perspective-bold-duotone size-5"></div>
        </button>
        <button className="text-gray-400 hover:text-[#8093EB] text-2xl">
          <div className="i-solar:point-on-map-perspective-bold-duotone size-5"></div>
        </button> */}
      </div>
    </header>
  );
};

export default Topbar;