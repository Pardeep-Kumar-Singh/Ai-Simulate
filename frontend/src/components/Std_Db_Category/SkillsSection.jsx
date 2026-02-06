import React, { useState, useEffect, useContext } from 'react';
import { Search, Award, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from "../../context/AuthContext";

const SkillsDashboard = () => {
  const { user } = useContext(AuthContext);
  const [skills, setSkills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Fetch user's skills from Backend
  useEffect(() => {
    const fetchSkills = async () => {
      if (user && user.uid) {
        try {
          const res = await axios.get(`${API_URL}/users/${user.uid}`);
          if (res.data && res.data.skills) {
            setSkills(res.data.skills);
          }
        } catch (error) {
          console.error("Error fetching skills:", error);
        }
      }
    };
    fetchSkills();
  }, [user, API_URL]);

  // Filter skills based on search term
  const filteredSkills = skills.filter((skill) =>
    typeof skill === 'string'
      ? skill.toLowerCase().includes(searchTerm.toLowerCase())
      : skill.name && skill.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-transparent space-y-5">
      {/* Search */}
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSkills.length > 0 ? (
          filteredSkills.map((skill, index) => {
            const skillObj = typeof skill === 'string' ? { name: skill } : skill;

            return (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-5 border border-transparent shadow-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-white">{skillObj.name}</h3>
                  {skillObj.trending === 'up' && <TrendingUp className="w-5 h-5 text-green-200" />}
                </div>

                {skillObj.level && (
                  <p className="text-white text-sm mb-1">
                    Level: <span className="font-semibold">{skillObj.level}</span>
                  </p>
                )}

                {skillObj.certifications > 0 && (
                  <p className="text-white text-sm flex items-center gap-1">
                    <Award className="w-4 h-4 text-yellow-300" /> {skillObj.certifications} Certification(s)
                  </p>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-slate-400 text-sm col-span-full">
            No skills added yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default SkillsDashboard;
