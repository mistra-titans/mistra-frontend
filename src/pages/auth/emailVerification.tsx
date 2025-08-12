// import * as React from "react";
// import Button from "../../components/button";
// import Toast from "../../components/Toast";
// import { useState, useRef, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { useAuth } from "../contexts/authcontext";

// const EmailVerification: React.FC = () => {
//   const [otp, setOtp] = useState(["", "", "", "", "", ""]);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [showToast, setShowToast] = useState(false);
//   const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
//   const { verifyEmail, loading } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Get email from navigation state (passed from signup)
//   const email = location.state?.email || "Email address";

//   // Create refs for each input
//   const inputRefs = [
//     useRef<HTMLInputElement>(null),
//     useRef<HTMLInputElement>(null),
//     useRef<HTMLInputElement>(null),
//     useRef<HTMLInputElement>(null),
//     useRef<HTMLInputElement>(null),
//     useRef<HTMLInputElement>(null),
//   ];

//   // Focus first input on component mount
//   useEffect(() => {
//     if (inputRefs[0].current) {
//       inputRefs[0].current.focus();
//     }
//   }, []);

//   const handleOtpChange = (value: string, index: number) => {
//     // Only allow numeric input
//     const numericValue = value.replace(/[^0-9]/g, "");

//     const newOtp = [...otp];
//     newOtp[index] = numericValue;
//     setOtp(newOtp);
//     setError(""); // Clear error when user types

//     // Auto-focus next input
//     if (numericValue && index < 5) {
//       inputRefs[index + 1].current?.focus();
//     }
//   };

//   const handleKeyDown = (
//     e: React.KeyboardEvent<HTMLInputElement>,
//     index: number
//   ) => {
//     if (e.key === "Backspace") {
//       const newOtp = [...otp];

//       if (otp[index]) {
//         // Clear current input
//         newOtp[index] = "";
//         setOtp(newOtp);
//       } else if (index > 0) {
//         // Move to previous input and clear it
//         newOtp[index - 1] = "";
//         setOtp(newOtp);
//         inputRefs[index - 1].current?.focus();
//       }
//     }
//   };

//   const handleVerify = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const code = otp.join("");

//     if (code.length !== 6) {
//       setError("Please enter all 6 digits");
//       setSuccess("");
//       setShowToast(true);
//       return;
//     }

//     const result = await verifyEmail(code);
//     if (result.success) {
//       setSuccess("Email verified successfully!");
//       setError("");
//       setShowToast(true);
//       setTimeout(() => navigate("/SignUp"), 1500);
//     } else {
//       setError(
//         result.message || "Incorrect verification code. Please try again."
//       );
//       setSuccess("");
//       setShowToast(true);
//     }
//   };

//   const handleResend = async () => {
//     // You can implement resend functionality here if you add it to auth context
//     // For now, just show a message
//     setError("");
//     console.log("Resend verification code to:", email);
//     // You could add a success message here
//   };

//   const renderOtpInput = (index: number) => {
//     const isFocused = focusedIndex === index;
//     const isFilled = otp[index] !== "";

//     return (
//       <input
//         key={index}
//         ref={inputRefs[index]}
//         type="text"
//         value={otp[index]}
//         onChange={(e) => handleOtpChange(e.target.value, index)}
//         onKeyDown={(e) => handleKeyDown(e, index)}
//         onFocus={() => setFocusedIndex(index)}
//         onBlur={() => setFocusedIndex(null)}
//         maxLength={1}
//         className={`
//           w-12 h-14 border-2 rounded-lg text-center text-lg font-bold 
//           transition-all duration-200 bg-gray-50/50
//           ${
//             isFocused
//               ? "border-blue-500 ring-2 ring-blue-500/20 shadow-md"
//               : isFilled
//               ? "border-[#5C6BC0] bg-blue-50/50"
//               : "border-gray-200"
//           }
//           focus:outline-none
//         `}
//         inputMode="numeric"
//         pattern="[0-9]*"
//         autoComplete="one-time-code"
//       />
//     );
//   };

//   return (
//     <>
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
//         <div className="w-full max-w-5xl flex items-center justify-center">
//           {/* Single centered form container - no side image */}
//           <div className="w-full max-w-lg mx-auto">
//             <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 lg:p-8 lg:h-[600px] flex flex-col justify-center">
//               {/* Header */}
//               <div className="text-center mb-6 lg:mb-8">
//                 <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
//                   <img
//                     src="image.png"
//                     alt="Logo"
//                     className="w-10 h-10 object-contain"
//                   />
//                 </div>
//                 <h1 className="text-2xl font-bold text-gray-900 mb-2">
//                   Email Verification
//                 </h1>
//                 <p className="text-gray-600">
//                   Enter the 6-digit code sent to{" "}
//                   <span className="font-medium text-gray-800">{email}</span>
//                 </p>
//               </div>

//               <div className="-mt-2 lg:-mt-4">
//                 <form
//                   onSubmit={handleVerify}
//                   className="space-y-4 lg:space-y-6"
//                 >
//                   {/* OTP Input Container */}
//                   <div className="flex justify-between gap-3 mb-6">
//                     {Array.from({ length: 6 }, (_, index) =>
//                       renderOtpInput(index)
//                     )}
//                   </div>

//                   {/* Verify Button */}
//                   <Button
//                     type="submit"
//                     name="Verify Email"
//                     loading={loading}
//                     width="100%"
//                     height="48px"
//                     className="mt-2"
//                     disabled={loading || otp.join("").length !== 6}
//                   />
//                 </form>

//                 {/* Resend Section */}
//                 <div className="mt-6 lg:mt-8 text-center">
//                   <p className="text-gray-600 text-sm">
//                     Didn't receive the code?{" "}
//                     <span className="text-blue-600 ">Resend</span>
//                   </p>
//                 </div>

//                 {/* Back to Sign Up */}
//                 <div className="mt-6 text-center">
//                   <Button
//                     type="button"
//                     name={
//                       <span className="inline-flex items-center">
//                         <div className="i-solar:arrow-left-line-duotone" />
//                         Back to Sign Up
//                       </span>
//                     }
//                     width="210px"
//                     height="56px"
//                     className="inline-flex items-center text-[#5C6BC0] hover:text-[#3F51B5] font-medium transition-colors"
//                     onClick={() => navigate("/signup")}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* Error Message */}
//       {/* Toast for success and error messages */}
//       {showToast && (error || success) && (
//         <Toast
//           message={error || success}
//           type={error ? "error" : "success"}
//           duration={3000}
//           onClose={() => {
//             setShowToast(false);
//             setError("");
//             setSuccess("");
//           }}
//         />
//       )}
//     </>
//   );
// };

// export default EmailVerification;
