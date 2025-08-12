import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./pages/contexts/authcontext.tsx";
import SignUp from "./pages/auth/SignUp.tsx";
import ForgotPassword from "./pages/auth/forget.tsx";
import Activity from "./pages/activity.tsx";
import Profile from "./pages/profile.tsx";
import Payment from "./pages/payment.tsx";
import Home from "./pages/home.tsx";
import Transactions from "./pages/transactions.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/signup" element={<SignUp/>}/>
          <Route path="/forget" element={<ForgotPassword/>}/>
          <Route path="/activity" element={<Activity/>}/>
          <Route path="/profile" element={<Profile/>}/>
          <Route path="/payment" element={<Payment/>}/>
          <Route path="/home" element={<Home/>}/>
          <Route path="/transactions" element={<Transactions/>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);