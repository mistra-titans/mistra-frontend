import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  duration?: number;
  onClose?: () => void;
}

const typeStyles = {
  success: {
    bg: "bg-emerald-500",
    border: "border-emerald-400",
    icon: CheckCircle,
    shadow: "shadow-emerald-500/20",
  },
  error: {
    bg: "bg-red-500",
    border: "border-red-400",
    icon: XCircle,
    shadow: "shadow-red-500/20",
  },
};

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  duration = 3000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const style = typeStyles[type];
  const IconComponent = style.icon;

  useEffect(() => {
    // Trigger entrance animation
    const showTimer = setTimeout(() => setIsVisible(true), 10);

    if (duration && onClose) {
      const hideTimer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(onClose, 300); // Wait for exit animation
      }, duration);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }

    return () => clearTimeout(showTimer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose?.(), 300);
  };

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 max-w-sm transform transition-all duration-300 ease-out ${
        isVisible && !isExiting
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-full opacity-0 scale-95"
      }`}
      role="alert"
    >
      <div
        className={`${style.bg} ${style.border} ${style.shadow} text-white px-4 py-3 rounded-lg shadow-lg border backdrop-blur-sm flex items-center gap-3 font-medium`}
      >
        <div className="flex-shrink-0">
          <IconComponent className="w-5 h-5" />
        </div>

        <div className="flex-1 text-sm leading-relaxed">{message}</div>

        {onClose && (
          <button
            className="flex-shrink-0 ml-2 text-white/70 hover:text-white transition-colors duration-200 p-1 rounded-full hover:bg-white/10"
            onClick={handleClose}
            aria-label="Close toast"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;
