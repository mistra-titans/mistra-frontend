import * as React from "react";
import Button from "../../components/button";
import Toast from "../../components/Toast";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/authcontext";

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showToast, setShowToast] = useState(false);
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation logic here...

    // Build payload for register endpoint
    const payload = {
      phone: formData.phone,
      first_name: formData.firstname,
      last_name: formData.lastname,
      email: formData.email,
      password: formData.password,
    };

    const result = await signup(payload);
    if (result.success) {
      setSuccess("Registration successful!");
      setShowToast(true);
      // navigate or other logic
    } else {
      setError(result.message || "Registration failed");
      setShowToast(true);
    }
  };
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl flex items-center justify-center lg:justify-start">
          {/* Left side image - hidden on smaller screens */}
          <div className="hidden lg:flex lg:w-1/2 items-center justify-center">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
                alt="Credit cards and fintech"
                className="w-full h-screen object-cover rounded-r-none rounded-l-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-r-none rounded-l-2xl"></div>
            </div>
          </div>

          {/* Right side form - centered on smaller screens */}
          <div className="w-full lg:w-1/2 max-w-lg mx-auto lg:mx-0">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl lg:rounded-r-2xl lg:rounded-l-none shadow-xl border border-white/20 p-6 lg:p-8 lg:h-screen flex flex-col justify-center overflow-y-auto">
              <div className="text-center mb-6 lg:mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
                  <img
                    src="image.png"
                    alt="Logo"
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Create Account
                </h1>
                <p className="text-gray-600">Join us today</p>
              </div>

              <div className="-mt-2 lg:-mt-4">
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 lg:space-y-6"
                >
                  <div className="space-y-3 lg:space-y-4">
                    {/* First and Last Name - Side by side */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="firstname"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          First Name
                        </label>
                        <div className="relative">
                          <div className="i-solar:user-bold-duotone size-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"></div>
                          <input
                            id="firstname"
                            name="firstname"
                            type="text"
                            value={formData.firstname}
                            onChange={handleChange}
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                            placeholder="First name"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="lastname"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Last Name
                        </label>
                        <div className="relative">
                          <div className="i-solar:user-bold-duotone size-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"></div>
                          <input
                            id="lastname"
                            name="lastname"
                            type="text"
                            value={formData.lastname}
                            onChange={handleChange}
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                            placeholder="Last name"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="i-solar:point-on-map-perspective-bold-duotone size-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"></div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="i-solar:phone-bold-duotone size-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"></div>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>

                    {/* Password and Confirm Password - Side by side */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                            placeholder="Password"
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

                      <div>
                        <label
                          htmlFor="confirmPassword"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Confirm Password
                        </label>
                        <div className="relative">
                          <div className="i-solar:lock-keyhole-minimalistic-bold-duotone size-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"></div>
                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                            placeholder="Confirm password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showConfirmPassword ? (
                              <div className="i-solar:eye-bold-duotone size-5"></div>
                            ) : (
                              <div className="i-solar:eye-closed-bold-duotone size-5"></div>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    name="Create Account"
                    loading={loading}
                    width="100%"
                    height="48px"
                    className="mt-2"
                  />
                </form>

                <div className="mt-6 lg:mt-8 text-center">
                  <p className="text-gray-600">
                    Already have an account?{" "}
                    <Link
                      to="/"
                      className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Sign in
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

export default SignUp;
