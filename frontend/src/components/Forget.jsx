
import React, { useState } from "react";
import { Link } from "react-router-dom";

const Forget = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    // Mock behavior for now as email service is not configured
    setTimeout(() => {
      setMessage("Password reset feature is currently being upgraded. Please contact the administrator to reset your password.");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 sm:px-6 md:px-8">
      <div className="w-full max-w-md bg-slate-800/80 p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-700">

        {/* Logo + Title */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-md rotate-12"></div>
          </div>
          <h2 className="mt-4 text-xl sm:text-2xl font-bold text-white">Forget Password</h2>
          <p className="text-gray-400 text-xs sm:text-sm">Enter your email to reset your password</p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleForgetPassword}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base"
          />

          {error && <p className="text-red-400 text-xs sm:text-sm">{error}</p>}
          {message && <p className="text-green-400 text-xs sm:text-sm">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 sm:py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium text-sm sm:text-base shadow-lg hover:opacity-90 transition disabled:opacity-50 active:scale-95"
          >
            {loading ? "Sending..." : "Forget Password"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-gray-400 text-xs sm:text-sm">
          Back to Sign in{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Forget;
