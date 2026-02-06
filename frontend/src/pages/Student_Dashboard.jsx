import React, { useState, useEffect, useRef } from "react";
import { Menu, X, Sun, Moon, ChevronDown } from "lucide-react";

import Sidebar from "../components/Sidebar";
import SkillsSection from "../components/Std_Db_Category/SkillsSection";
import CourseSuggestions from "../components/Std_Db_Category/Course_Suggestion";
import MainDashboard from "../components/Std_Db_Category/MainDashboard";
import Resume_Analysis from "../components/Std_Db_Category/Resume_Analysis";
import Profile from "../components/Std_Db_Category/Profile";

const Student_Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [theme, setTheme] = useState("default"); 
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "default";
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    let isDark = false;

    if (theme === "dark") isDark = true;
    else if (theme === "light") isDark = false;
    else {
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    document.body.classList.toggle("dark", isDark);
  }, [theme]);

  const isDarkMode =
    theme === "dark" ||
    (theme === "default" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getThemeClasses = () => {
    switch (theme) {
      case "light":
        return {
          bg: "bg-gradient-to-br from-[#fff9f2] to-[#f2f8ff]",
          text: "text-gray-900",
          header: "bg-white border-gray-300",
          icon: "text-blue-600",
          hover: "hover:bg-blue-100",
        };
      case "dark":
        return {
          bg: "bg-gradient-to-br from-[#0f0f1a] to-[#1c1b29]",
          text: "text-gray-200",
          header: "bg-[#181825] border-[#2f2f40]",
          icon: "text-cyan-400",
          hover: "hover:bg-[#2c2c3b]",
        };
      default:
        return {
          bg: "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500",
          text: "text-white",
          header: "bg-indigo-700 border-indigo-500",
          icon: "text-blue-200",
          hover: "hover:bg-indigo-500",
        };
    }
  };

  const colors = getThemeClasses();

  return (
    <div
      className={`h-screen flex overflow-hidden transition-all duration-500 ${colors.bg} ${colors.text}`}
    >
      <Sidebar
        sidebarOpen={sidebarOpen}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
        darkMode={isDarkMode}
      />

      <div className="flex-1 flex flex-col relative">
        {/* Top Bar */}
        <header
          className={`px-6 h-16 flex items-center justify-between border-b transition-all duration-500 ${colors.header}`}
        >
          <div className="flex items-center gap-4">
            {/* Hide menu toggle button on mobile */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg transition-all ${colors.hover} hidden md:block`}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <h1 className="text-xl font-semibold tracking-wide">
              {activeItem}
            </h1>
          </div>

          {/* Theme Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`p-2 rounded-lg flex items-center gap-1 transition-all ${colors.hover} ${colors.icon}`}
            >
              {theme === "dark" ? (
                <Moon size={20} />
              ) : theme === "light" ? (
                <Sun size={20} />
              ) : (
                <Sun size={20} className="text-yellow-200" />
              )}
              <ChevronDown size={16} />
            </button>

            {dropdownOpen && (
              <div
                className={`absolute z-10 right-0 mt-2 w-44 rounded-xl shadow-2xl border border-gray-300/20 backdrop-blur-md transform transition-all duration-300 origin-top-right ${
                  isDarkMode
                    ? "bg-[#1f1f2e]/95 text-gray-100"
                    : "bg-white/90 text-gray-800"
                }`}
              >
                {[
                  { key: "default", label: "Default (Gradient)" },
                  { key: "light", label: "Light Mode" },
                  { key: "dark", label: "Dark Mode" },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => {
                      setTheme(option.key);
                      setDropdownOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2.5 text-sm rounded-lg font-medium capitalize transition-all ${
                      theme === option.key
                        ? "bg-gradient-to-r from-pink-500 to-indigo-500 text-white shadow-md scale-[1.02]"
                        : "hover:bg-gray-100 dark:hover:bg-[#2d2d40]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main
          className={`flex-1 overflow-y-auto p-6 transition-all duration-500 ${colors.bg}`}
        >
          {activeItem === "Skills" && <SkillsSection />}
          {activeItem === "Course Suggest" && <CourseSuggestions />}
          {activeItem === "Dashboard" && (
            <MainDashboard setActiveItem={setActiveItem} />
          )}
          {activeItem === "Resume Analysis" && <Resume_Analysis />}
          {activeItem === "Profile" && <Profile />}
        </main>
      </div>
    </div>
  );
};

export default Student_Dashboard;
