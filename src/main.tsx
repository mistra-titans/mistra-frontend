import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from "./pages/auth/SignUp.tsx";
// import ForgotPassword from "./pages/auth/forgotPassword.tsx";
import Activity from "./pages/activity.tsx";
import Profile from "./pages/profile.tsx";
import Payment from "./pages/payment.tsx";
import Home from "./pages/home.tsx";
import Transactions from "./pages/transactions.tsx";
// import EmailVerification from "./pages/auth/emailVerification.tsx";
import "virtual:uno.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProtectedRoute from "./components/ProtectedRoute.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/signup" element={<SignUp />} />
          {/* <Route path="/forgotpassword" element={<ForgotPassword/>}/> */}

          <Route
            path="/activity"
            element={
              <ProtectedRoute>
                <Activity />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            }
          />
          {/* <Route path="/email-verification" element={<EmailVerification/>}/> */}
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
