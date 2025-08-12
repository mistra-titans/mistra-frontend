import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./pages/contexts/authcontext.tsx";
import SignUp from "./pages/auth/SignUp.tsx";
import ForgotPassword from "./pages/auth/forget.tsx";
import Activity from "./pages/activity.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/signup" element={<SignUp/>}/>
          <Route path="/forget" element={<ForgotPassword/>}/>
          <Route path="/activity" element={<Activity/>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);