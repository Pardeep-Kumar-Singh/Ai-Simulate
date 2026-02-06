import React, { useContext } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Forget from "./components/Forget";
import StudentDashboard from "./pages/Student_Dashboard";
import AdminDashboard from "./pages/Admin_Dashboard";
import CourseSuggestions from './components/Std_Db_Category/Course_Suggestion';
import { AuthContext } from "./context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  // Optional: Add a loading check if user persistence is async, 
  // but AuthContext initializes synchronously from localStorage in useEffect, 
  // which might cause a flash of login.
  // Ideally AuthContext should expose a 'loading' state.
  // For now, sticking to localStorage fallback to avoid flash if context is still initializing
  // OR checking if user is null but maybe in localStorage.

  // Actually, let's keep it simple. If we rely on Context, we must wait for it to init.
  // AuthContext provided earlier does `useEffect` for localStorage. 
  // Initial state is null.
  // So on refresh, user is null -> redirects to login.
  // Fixing this requires AuthContext to start with lazy initializer or loading state.

  // Let's modify AuthContext to be safer or just stick to localStorage check for the route *protection* 
  // to avoid flashing. 
  // But wait, user was using localStorage.getItem("user") directly.
  // Mixing context and direct storage access is messy.
  // Let's rely on localStorage for the *primary* protection check to be fast, 
  // compatible with how AuthProvider initializes.

  const storedUser = localStorage.getItem("user");
  return storedUser ? children : <Navigate to="/login" />;
};

function App() {

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<Forget />} />

      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
