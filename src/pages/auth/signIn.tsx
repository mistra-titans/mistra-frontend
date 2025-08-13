import * as React from "react";
import Button from "../../components/button";
import Toast from "../../components/Toast";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/use-auth";

const SignIn: React.FC = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showToast, setShowToast] = useState(false);
  const { login } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/SignIn";
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!emailOrPhone || !password) {
      setError("Please fill in all fields");
      setShowToast(true);
      return;
    }

    const payload = {
      phone_or_email: emailOrPhone,
      password,
    };

    login.mutate(payload, {
      onSuccess: () => {
        setSuccess("Login successful!");
        setShowToast(true);
        setTimeout(() => navigate("/home"), 1500);
      },
      onError: (error: any) => {
        setError(error?.message || "Invalid Email or Password");
        setShowToast(true);
      },
    });
  };
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl flex items-center justify-center lg:justify-start">
          {/* Left side image - hidden on smaller screens */}
          <div className="hidden lg:flex lg:w-1/2 items-center justify-center">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
                alt="Credit cards and fintech"
                className="w-full h-[600px] object-cover rounded-r-none rounded-l-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-r-none rounded-l-2xl"></div>
            </div>
          </div>

          {/* Right side form - centered on smaller screens */}
          <div className="w-full lg:w-1/2 max-w-lg mx-auto lg:mx-0">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl lg:rounded-r-2xl lg:rounded-l-none shadow-xl border border-white/20 p-6 lg:p-8 lg:h-[600px] flex flex-col justify-center">
              <div className="text-center mb-6 lg:mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
                  <img
                    src="image.png"
                    alt="Logo"
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome Back
                </h1>
                <p className="text-gray-600">Sign in to your account</p>
              </div>

              <div className="-mt-2 lg:-mt-4">
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 lg:space-y-6"
                >
                  <div className="space-y-3 lg:space-y-4">
                    <div>
                      <label
                        htmlFor="emailOrPhone"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Email Address or Phone Number
                      </label>
                      <div className="relative">
                        <div className="i-solar:point-on-map-perspective-bold-duotone size-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"></div>
                        <input
                          id="emailOrPhone"
                          type="text"
                          value={emailOrPhone}
                          onChange={(e) => setEmailOrPhone(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                          placeholder="Enter your email or phone number"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <div className="i-solar:lock-keyhole-minimalistic-bold-duotone size-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"></div>
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? (
                            <div className="i-solar:eye-bold-duotone size-5"></div>
                          ) : (
                            <div className="i-solar:eye-closed-bold-duotone size-5"></div>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Link
                      to="/forgotpassword"
                      className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    name="Sign In"
                    loading={login.isPending}
                    width="100%"
                    height="48px"
                    className="mt-2"
                  />
                </form>

                <div className="mt-6 lg:mt-8 text-center">
                  <p className="text-gray-600">
                    Don't have an account?{" "}
                    <Link
                      to="/signup"
                      className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Toast for success and error messages */}
      {showToast && (error || success) && (
        <Toast
          message={error || success}
          type={error ? "error" : "success"}
          duration={3000}
          onClose={() => {
            setShowToast(false);
            setError("");
            setSuccess("");
          }}
        />
      )}
    </>
  );
};

export default SignIn;
