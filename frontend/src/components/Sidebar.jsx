import React, { useState, useEffect, useRef, useContext } from "react";
import { Home, Award, BadgeCheck, FileSearch, ChevronDown, Menu } from "lucide-react";
import MenuItem from "./MenuItem";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

import MaleIcon from "../assets/male.png";
import FemaleIcon from "../assets/female.png";

const Sidebar = ({ sidebarOpen, activeItem, setActiveItem, darkMode }) => {
  const { user, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    jobRole: "",
    profileImage: "",
    gender: "male",
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 768);

  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  let hideTimer = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const mainMenuItems = [
    { icon: Home, label: "Dashboard" },
    { icon: Award, label: "Skills" },
    { icon: BadgeCheck, label: "Course Suggest" },
    { icon: FileSearch, label: "Resume Analysis" },
  ];

  // Detect and handle screen size changes
  useEffect(() => {
    const handleResize = () => {
      const mobileView = window.innerWidth < 768;
      setIsMobile(mobileView);
      if (!mobileView) {
        // Back to desktop → show sidebar & clear timers
        setShowSidebar(true);
        clearTimeout(hideTimer.current);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (user && user.uid) {
        try {
          const res = await axios.get(`${API_URL}/users/${user.uid}`);
          if (res.data) {
            const data = res.data;
            setUserData({
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              jobRole: data.jobRole || "",
              profileImage: data.profileImage || "",
              gender: data.gender || "male",
            });
          }
        } catch (error) {
          console.error("Error fetching user data for sidebar:", error);
        }
      }
    };
    fetchUserData();
  }, [user, API_URL]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getProfileImage = () => {
    if (userData.profileImage) return userData.profileImage;
    return userData.gender === "male" ? MaleIcon : FemaleIcon;
  };

  // Auto-hide dropdown after 5 seconds
  useEffect(() => {
    if (dropdownOpen) {
      hideTimer.current = setTimeout(() => setDropdownOpen(false), 5000);
    }
    return () => clearTimeout(hideTimer.current);
  }, [dropdownOpen]);

  // Auto-hide sidebar after 5 seconds (only on mobile)
  useEffect(() => {
    if (isMobile && showSidebar) {
      const timer = setTimeout(() => setShowSidebar(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isMobile, showSidebar]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button
          className="p-3 fixed top-2.5 right-18 z-50 rounded-md text-white shadow-md"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          <Menu size={22} />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 h-full z-40 transition-all duration-300 flex flex-col 
        ${isMobile ? (showSidebar ? "translate-x-0" : "-translate-x-full") : "translate-x-0"} 
        ${isMobile ? "w-56" : sidebarOpen ? "w-64" : "w-16"} 
        ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-300"} border-r`}
      >
        {/* Header */}
        <div className={`p-4 border-b ${darkMode ? "border-slate-700" : "border-gray-300"}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <div className="w-4 h-4 bg-white rounded-sm transform rotate-12"></div>
            </div>
            {(sidebarOpen || isMobile) && (
              <div className={`font-semibold text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>
                AI SIMULATE
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6">
          <nav className="space-y-1">
            {mainMenuItems.map((item, index) => (
              <div key={index} className="group relative">
                <MenuItem
                  icon={item.icon}
                  label={item.label}
                  active={activeItem === item.label}
                  sidebarOpen={sidebarOpen || isMobile}
                  onClick={() => setActiveItem(item.label)} // ✅ Only change on click
                />
                {!sidebarOpen && !isMobile && (
                  <span
                    className={`absolute left-16 top-1/2 -translate-y-1/2 px-2 py-1 text-xs rounded-md 
                    ${darkMode ? "bg-slate-700 text-gray-200" : "bg-gray-200 text-gray-700"} hidden group-hover:block`}
                  >
                    {item.label}
                  </span>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* User Profile */}
        <div
          className={`border-t p-4 relative ${darkMode ? "border-slate-700" : "border-gray-300"}`}
          ref={dropdownRef}
        >
          <div
            className={`flex items-center cursor-pointer ${sidebarOpen || isMobile ? "gap-3" : "justify-center"
              }`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <img
              src={getProfileImage()}
              alt={`${userData.firstName} ${userData.lastName}`}
              className={`w-8 h-8 rounded-full ring-2 ${darkMode ? "ring-slate-600" : "ring-gray-300"
                }`}
              title={!sidebarOpen ? `${userData.firstName} ${userData.lastName}` : ""}
            />
            {(sidebarOpen || isMobile) && (
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <div
                    className={`font-medium text-sm ${darkMode ? "text-white" : "text-gray-900"
                      }`}
                  >
                    {userData.firstName} {userData.lastName}
                  </div>
                  <div
                    className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                  >
                    {userData.jobRole}
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className={darkMode ? "text-gray-400" : "text-gray-600"}
                />
              </div>
            )}
          </div>

          {dropdownOpen && (sidebarOpen || isMobile) && (
            <div
              className={`absolute bottom-16 left-4 w-52 
              ${darkMode
                  ? "bg-slate-700"
                  : "bg-white"
                }`}
            >
              <button
                onClick={() => setActiveItem("Profile")}
                className={`w-full text-left px-4 py-2 ${darkMode
                    ? "text-gray-200 hover:bg-slate-600"
                    : "text-gray-700 hover:bg-gray-200"
                  }`}
              >
                View / Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className={`w-full text-left px-4 py-2 ${darkMode
                    ? "text-gray-200 hover:bg-slate-600"
                    : "text-gray-700 hover:bg-gray-200"
                  }`}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
