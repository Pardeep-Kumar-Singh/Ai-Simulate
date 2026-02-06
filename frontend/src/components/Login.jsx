
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (email === "admin" && password === "admin@123") {
      if (rememberMe) {
        localStorage.setItem("user", JSON.stringify({ role: "admin" }));
      } else {
        sessionStorage.setItem("user", JSON.stringify({ role: "admin" }));
      }
      navigate("/admin-dashboard");
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/login`, {
        email: email,
        password: password
      });

      if (response.data && response.data.user) {
        const user = response.data.user;
        if (rememberMe) {
          localStorage.setItem("user", JSON.stringify(user));
        } else {
          sessionStorage.setItem("user", JSON.stringify(user));
        }
        navigate("/student-dashboard");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 sm:px-6 md:px-8">
      <div className="w-full max-w-sm sm:max-w-md bg-slate-800/80 p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-700 transition-all duration-300">

        {/* Logo + Title */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-md rotate-12"></div>
          </div>
          <h2 className="mt-4 text-xl sm:text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-gray-400 text-xs sm:text-sm">Login to continue your journey</p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Email or Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 sm:px-4 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base"
          />

          {/* Password field with eye icon */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 sm:px-4 py-2 pr-10 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Remember me + Forgot password */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-gray-400 gap-2 sm:gap-0">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500"
              />
              Remember me
            </label>

            <Link to="/forgot-password" className="text-blue-400 hover:underline">
              Forgot password?
            </Link>
          </div>

          {error && <p className="text-red-400 text-xs sm:text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg hover:opacity-90 transition text-sm sm:text-base"
          >
            Sign In
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-gray-400 text-xs sm:text-sm">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
