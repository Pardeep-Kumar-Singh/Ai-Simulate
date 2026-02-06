import React from "react";

const MenuItem = ({ icon: Icon, label, active = false, sidebarOpen, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 ${sidebarOpen ? 'px-4' : 'px-3 justify-center'} py-2.5 mx-2 rounded-lg cursor-pointer transition-all duration-200 group relative ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
        : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
    }`}
    title={!sidebarOpen ? label : ''}
  >
    {Icon && <Icon size={20} className={active ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'} />}
    {sidebarOpen && <span className="font-medium">{label}</span>}
    {sidebarOpen && active && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
    {!sidebarOpen && active && <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-full" />}
  </div>
);

export default MenuItem;
