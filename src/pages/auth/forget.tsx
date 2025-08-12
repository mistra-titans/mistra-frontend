import  * as React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/authcontext'; // Fixed import path to match your structure
import { Mail, ArrowLeft,  CheckCircle } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { resetPassword, loading } = useAuth();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  if(!email){
    setError('Please enter your email address')
  }
  const result = await resetPassword(email);
  if(result.success){
    setSuccess(true);
  }
  else{
    setError(result.message || 'Failed to send reset email. Please check your email address.')
  }
}

  if (success) {
    return (
      <div className="min-h-screen   flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FF6B47] via-[#B39DDB] to-[#5C6BC0] rounded-full mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email</h1>
            <p className="text-gray-600 mb-8">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center w-full bg-[#5C6BC0] to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16  from-[#FF6B47] via-[#B39DDB] to-[#5C6BC0] rounded-full mb-4">
              {/* Use your custom image like in other components */}
              <img src="image.png" alt="Logo" className="w-10 h-10 object-contain" />
              {/* Fallback icon if image not working */}
              {/* <KeyRound className="w-8 h-8 text-white" /> */}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-600">Enter your email to receive a reset link</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5C6BC0] to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending reset link...
                </div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;