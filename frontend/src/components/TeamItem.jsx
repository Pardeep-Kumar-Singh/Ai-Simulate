import React from "react";

const TeamItem = ({ id, label, bgColor }) => (
  <div className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-slate-700/50 group">
    <div className={`w-8 h-8 ${bgColor} rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
      {id}
    </div>
    <span className="text-gray-300 group-hover:text-white font-medium">{label}</span>
  </div>
);

export default TeamItem;
