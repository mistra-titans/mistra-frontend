import React from "react";

interface CardProps {
  width?: string;
  height?: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  width = "w-full lg:w-1/2 max-w-lg mx-auto lg:mx-0",
  height = "lg:h-screen",
  children,
  className = "",
}) => {
  return (
    <div className={width}>
      <div
        className={`bg-white/80 backdrop-blur-sm rounded-2xl  border border-white/20 p-6 lg:p-8 flex flex-col justify-center overflow-y-auto ${height} ${className}`}
      >
        {children}
      </div>
    </div>
  );
};

export default Card;
