import React, { useState, useEffect, useContext } from "react";
import { Mail, Phone, MapPin, Briefcase, Edit2, Save, X } from "lucide-react";
import MaleIcon from "../../assets/male.png";
import FemaleIcon from "../../assets/female.png";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

const ProfileSection = () => {
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    jobRole: "",
    email: "",
    contact: "",
    address: "",
    gender: "male",
    skills: [],
  });
  const [tempData, setTempData] = useState({ ...formData });
  const [contactError, setContactError] = useState("");
  const [numSkills, setNumSkills] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchUserData = async () => {
      if (user && user.uid) {
        try {
          const res = await axios.get(`${API_URL}/users/${user.uid}`);
          if (res.data) {
            const data = res.data;
            const userData = {
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              jobRole: data.jobRole || "",
              email: data.email || user.email,
              contact: data.contact || "",
              address: data.address || "",
              gender: data.gender || "male",
              skills: data.skills || [],
            };
            setFormData(userData);
            setTempData(userData);
            setNumSkills(data.skills ? data.skills.length : 0);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    fetchUserData();
  }, [user, API_URL]);

  const handleInputChange = (field, value) => {
    if (field === "contact") {
      if (/^\d*$/.test(value) && value.length <= 10) {
        setTempData((prev) => ({ ...prev, contact: value }));
        if (value.length === 10) setContactError("");
      }
    } else {
      setTempData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSkillChange = (index, value) => {
    const updatedSkills = [...tempData.skills];
    updatedSkills[index] = value;
    setTempData((prev) => ({ ...prev, skills: updatedSkills }));
  };

  const handleNumSkillsChange = (value) => {
    const count = parseInt(value, 10);
    setNumSkills(count);
    const updatedSkills = Array(count)
      .fill("")
      .map((_, i) => tempData.skills[i] || "");
    setTempData((prev) => ({ ...prev, skills: updatedSkills }));
  };

  const handleSave = async () => {
    if (tempData.contact.length !== 10 && tempData.contact.length > 0) {
      setContactError("Contact number must be exactly 10 digits");
      return;
    }

    try {
      if (user && user.uid) {
        // Prepare data for update (excluding email usually)
        const updateData = { ...tempData, skillsCount: numSkills }; // skillsCount kept for compatibility if needed, but mainly skills array
        const res = await axios.put(`${API_URL}/users/${user.uid}`, updateData);

        if (res.data) {
          setFormData({ ...tempData });
          setIsEditing(false);
          setContactError("");
        }
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleCancel = () => {
    setTempData({ ...formData });
    setNumSkills(formData.skills.length);
    setIsEditing(false);
    setContactError("");
  };

  const handleEdit = () => setIsEditing(true);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-transparent rounded-xl">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-gray-600 text-base sm:text-lg">
          Manage your personal and professional details
        </h2>
      </div>

      <div className="bg-transparent rounded-lg p-4 sm:p-8 border border-gray-200">
        {/* Profile Icon */}
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
            <img
              src={formData.gender === "male" ? MaleIcon : FemaleIcon}
              alt={formData.gender}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-5 sm:space-y-6">
          {/* First Name & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={tempData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-transparent"
                  placeholder="Enter first name"
                />
              ) : (
                <div className="w-full px-4 py-2 sm:py-3 border border-gray-200 rounded-lg bg-transparent text-gray-800">
                  {formData.firstName}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={tempData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-transparent"
                  placeholder="Enter last name"
                />
              ) : (
                <div className="w-full px-4 py-2 sm:py-3 border border-gray-200 rounded-lg bg-transparent text-gray-800">
                  {formData.lastName}
                </div>
              )}
            </div>
          </div>

          {/* Job Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Role</label>
            {isEditing ? (
              <input
                type="text"
                value={tempData.jobRole}
                onChange={(e) => handleInputChange("jobRole", e.target.value)}
                className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-transparent"
                placeholder="Enter your job role"
              />
            ) : (
              <div className="w-full px-4 py-2 sm:py-3 border border-gray-200 rounded-lg bg-transparent text-gray-800">
                {formData.jobRole}
              </div>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            {isEditing ? (
              <select
                value={tempData.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                className="w-full mb-3 px-4 py-2 sm:py-3 border border-black text-black rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-transparent"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            ) : (
              <div className="w-full px-4 py-2 sm:py-3 border border-gray-200 rounded-lg bg-transparent text-gray-800">
                {formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1)}
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={formData.email}
              readOnly
              className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
            {isEditing ? (
              <>
                <input
                  type="tel"
                  value={tempData.contact}
                  onChange={(e) => handleInputChange("contact", e.target.value)}
                  className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-transparent"
                  placeholder="Enter 10-digit contact number"
                />
                {contactError && (
                  <p className="text-red-500 text-xs mt-1">{contactError}</p>
                )}
              </>
            ) : (
              <div className="w-full px-4 py-2 sm:py-3 border border-gray-200 rounded-lg bg-transparent text-gray-800">
                {formData.contact}
              </div>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            {isEditing ? (
              <textarea
                value={tempData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                rows={3}
                className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-transparent resize-none"
                placeholder="Enter your address"
              />
            ) : (
              <div className="w-full px-4 py-2 sm:py-3 border border-gray-200 rounded-lg bg-transparent text-gray-800">
                {formData.address}
              </div>
            )}
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Technical Skills</label>
            {isEditing ? (
              <>
                <select
                  value={numSkills}
                  onChange={(e) => handleNumSkillsChange(e.target.value)}
                  className="w-full mb-3 px-4 py-2 sm:py-3 border border-black text-black rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-transparent"
                >
                  <option value="0">Select number of skills</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
                {Array.from({ length: numSkills }, (_, i) => (
                  <input
                    key={i}
                    type="text"
                    value={tempData.skills[i] || ""}
                    onChange={(e) => handleSkillChange(i, e.target.value)}
                    placeholder={`Skill ${i + 1}`}
                    className="w-full mb-2 px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-transparent"
                  />
                ))}
              </>
            ) : formData.skills && formData.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No skills added yet</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end sm:space-x-4 space-y-3 sm:space-y-0 mt-8 pt-6 border-t border-gray-200">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors w-full sm:w-auto"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl w-full sm:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
