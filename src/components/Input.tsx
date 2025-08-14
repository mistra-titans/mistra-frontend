import React from "react";

interface InputProps {
  id?: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  disabled?: boolean;
  required?: boolean;
  icon?: React.ReactNode;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  name?: string;
}

const Input: React.FC<InputProps> = ({
  id,
  type = "text",
  value,
  onChange,
  placeholder = "",
  className = "",
  width,
  height,
  disabled = false,
  required = false,
  icon,
  onFocus,
  onBlur,
  autoComplete,
  name,
}) => {
  return (
    <div className="relative" style={{ width }}>
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-400">{icon}</span>
        </div>
      )}
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        className={`w-full ${
          icon ? "pl-11" : "pl-4"
        } pr-8 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        placeholder={placeholder}
        style={{ height }}
      />
    </div>
  );
};

export default Input;