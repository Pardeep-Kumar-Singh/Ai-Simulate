
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/signup`, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password
      });

      if (response.status === 200) {
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Signup failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-slate-800/80 p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-700">

        {/* Logo + Title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <div className="w-6 h-6 bg-white rounded-md rotate-12"></div>
          </div>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-white">Create Account</h2>
          <p className="text-gray-400 text-sm sm:text-base">Join us and start your journey today</p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* First & Last Name - stack on small screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />

          <input
            type="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />

          <input
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex items-start sm:items-center gap-2 text-gray-400 text-sm sm:text-base">
            <input type="checkbox" className="w-4 h-4 mt-1 sm:mt-0" required />
            <span className="leading-tight">
              I agree to the{" "}
              <Link to="/terms" className="text-blue-400 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-blue-400 hover:underline">
                Privacy Policy
              </Link>
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg hover:opacity-90 transition text-sm sm:text-base"
          >
            Create Account
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-gray-400 text-sm sm:text-base">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
