import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./pages/contexts/authcontext.tsx";
import SignUp from "./pages/auth/signup.tsx";
import ForgotPassword from "./pages/auth/forget.tsx";
import EmailVerification from "./pages/auth/emailVerification.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/signup" element={<SignUp/>}/>
          <Route path="/forget" element={<ForgotPassword/>}/>
          <Route path="/emailVerification" element={<EmailVerification/>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);