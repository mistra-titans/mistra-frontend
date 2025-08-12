// import * as React from "react";
// import Button from "../../components/button";
// import Toast from "../../components/Toast";
// import { useState } from "react";
// import { Link } from "react-router-dom";
// import { useAuth } from "../contexts/authcontext"; // Fixed import path to match your structure
// import { ArrowLeft, CheckCircle } from "lucide-react";

// const ForgotPassword: React.FC = () => {
//   const [email, setEmail] = useState("");
//   const [error, setError] = useState("");
//   const [showToast, setShowToast] = useState(false);
//   const [success, setSuccess] = useState(false);
//   const { resetPassword, loading } = useAuth();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");

//     if (!email) {
//       setError("Please enter your email address");
//       setShowToast(true);
//       return;
//     }
//     const result = await resetPassword(email);
//     if (result.success) {
//       setSuccess(true);
//     } else {
//       setError(
//         result.message ||
//           "Failed to send reset email. Please check your email address."
//       );
//       setShowToast(true);
//     }
//   };

//   if (success) {
//     return (
//       <>
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
//           <div className="w-full max-w-5xl flex items-center justify-center">
//             {/* Single centered form container - no side image */}
//             <div className="w-full max-w-lg mx-auto">
//               <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 lg:p-8 lg:h-[600px] flex flex-col justify-center">
//                 <div className="text-center">
//                   <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FF6B47] via-[#B39DDB] to-[#5C6BC0] rounded-full mb-6">
//                     <CheckCircle className="w-8 h-8 text-white" />
//                   </div>
//                   <h1 className="text-2xl font-bold text-gray-900 mb-4">
//                     Check Your Email
//                   </h1>
//                   <p className="text-gray-600 mb-8">
//                     We've sent a password reset link to <strong>{email}</strong>
//                   </p>
//                   <Link
//                     to="/"
//                     className="inline-flex items-center justify-center w-full bg-[#5C6BC0] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#4F60B8] transition-all duration-200"
//                   >
//                     <ArrowLeft className="w-5 h-5 mr-2" />
//                     Back to Sign In
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//         {/* success Message Toast */}
//         {showToast && success && (
//           <Toast
//             message={error}
//             type="success"
//             duration={3000}
//             onClose={() => setShowToast(false)}
//           />
//         )}
//       </>
//     );
//   }

//   return (
//     <>
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
//         <div className="w-full max-w-5xl flex items-center justify-center">
//           {/* Single centered form container - no side image */}
//           <div className="w-full max-w-lg mx-auto">
//             <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 lg:p-8 lg:h-[600px] flex flex-col justify-center">
//               <div className="text-center mb-6 lg:mb-8">
//                 <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
//                   <img
//                     src="image.png"
//                     alt="Logo"
//                     className="w-10 h-10 object-contain"
//                   />
//                 </div>
//                 <h1 className="text-2xl font-bold text-gray-900 mb-2">
//                   Reset Password
//                 </h1>
//                 <p className="text-gray-600">
//                   Enter your email to receive a reset link
//                 </p>
//               </div>

//               <div className="-mt-2 lg:-mt-4">
//                 <form
//                   onSubmit={handleSubmit}
//                   className="space-y-4 lg:space-y-6"
//                 >
//                   <div className="space-y-3 lg:space-y-4">
//                     <div>
//                       <label
//                         htmlFor="email"
//                         className="block text-sm font-medium text-gray-700 mb-2"
//                       >
//                         Email Address
//                       </label>
//                       <div className="relative">
//                         <div className="i-solar:point-on-map-perspective-bold-duotone size-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"></div>
//                         <input
//                           id="email"
//                           type="email"
//                           value={email}
//                           onChange={(e) => setEmail(e.target.value)}
//                           className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
//                           placeholder="Enter your email address"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   <Button
//                     type="submit"
//                     name="Send Reset Link"
//                     loading={loading}
//                     width="100%"
//                     height="48px"
//                     className="mt-2"
//                   />
//                 </form>

//                 <div className="mt-6 lg:mt-8 text-center">
//                   <Link
//                     to="/"
//                     className="inline-flex items-center text-[#5C6BC0] hover:text-[#3F51B5] font-medium transition-colors"
//                   >
//                     <ArrowLeft className="w-4 h-4 mr-2" />
//                     Back to Sign In
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* Error Message Toast */}
//       {showToast && error && (
//         <Toast
//           message={error}
//           type="error"
//           duration={3000}
//           onClose={() => setShowToast(false)}
//         />
//       )}
//     </>
//   );
// };

// export default ForgotPassword;
