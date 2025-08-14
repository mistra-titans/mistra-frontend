import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/use-auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Show loading spinner while checking authentication
  if (user.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8093EB]"></div>
      </div>
    );
  }

  if (!user.data) {
    navigate("/");
  }

  // If user is authenticated (either in context or localStorage), render the protected component
  return <>{children}</>;
};

export default ProtectedRoute;
