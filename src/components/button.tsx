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
}) => {
  // Convert width and height to numbers for calculation
  const widthNum =
    typeof width === "string"
      ? parseInt(width.replace(/[^0-9]/g, ""))
      : typeof width === "number"
      ? width
      : 170; // default width

  const heightNum =
    typeof height === "string"
      ? parseInt(height.replace(/[^0-9]/g, ""))
      : typeof height === "number"
      ? height
      : 48; // default height (equivalent to py-3)

  // Calculate font size based on both width and height
  // Base size is 14px for width 170px and height 48px
  const widthScale = widthNum / 170;
  const heightScale = heightNum / 48;
  const scale = Math.min(widthScale, heightScale); // Use the smaller scale to prevent overflow

  const fontSize = Math.min(
    Math.max(
      Math.round(scale * 14), // scale from base size
      11 // min size
    ),
    20 // max size
  );

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`w-full bg-[#5C6BC0] text-white py-3 px-4 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${className}`}
      style={{
        width,
        height,
        fontSize: `${fontSize}px`,
      }}
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
};

export default Button;
