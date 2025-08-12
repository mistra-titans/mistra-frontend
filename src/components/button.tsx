import React from "react";

interface ButtonProps {
  name: string | React.ReactNode;
  loading?: boolean;
  icon?: React.ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  width?: string | number;
  height?: string | number;
}

const Button: React.FC<ButtonProps> = ({
  name,
  loading = false,
  icon,
  type = "button",
  disabled = false,
  onClick,
  className = "",
  width,
  height,
}) => (
  <button
    type={type}
    disabled={disabled || loading}
    onClick={onClick}
    className={`w-full bg-[#5C6BC0] text-white py-3 px-4 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${className}`}
    style={{ width, height }}
  >
    {loading ? (
      <div className="flex items-center justify-center w-full">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
      </div>
    ) : (
      <>
        {icon && <span className="mr-1 flex items-center">{icon}</span>}
        <span className="text-center flex-1">{name}</span>
      </>
    )}
  </button>
);

export default Button;
