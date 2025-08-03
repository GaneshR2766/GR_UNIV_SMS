import React from 'react';
import { Link } from 'react-router-dom';

// CSS filter to convert black to orange-500 (#f97316)
const orangeFilter = {
  filter: 'brightness(0) saturate(100%) invert(61%) sepia(91%) saturate(1232%) hue-rotate(331deg) brightness(96%) contrast(91%)'
};

function Sidebar({ isOpen, sidebarRef }) {
  return (
    <div
      ref={sidebarRef}
      className={`fixed top-0 left-0 h-full w-64 bg-white/80 dark:bg-gray-800/80 shadow-lg z-50 transform transition-transform duration-300 backdrop-blur-md border-r border-white/30 dark:border-gray-700/50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-4 font-bold text-lg text-orange-500 border-b border-white/30 dark:border-gray-700/50 backdrop-blur-sm">
        <div className="flex items-center">
          <div className="mr-2" style={orangeFilter}>
            <img src="/menu.png" alt="Menu" className="h-5 w-5" />
          </div>
          Menu
        </div>
      </div>
      <ul className="p-4 space-y-2 text-gray-800 dark:text-white">
        <li>
          <Link
            to="/"
            className="flex items-center px-4 py-2 rounded hover:bg-white/50 hover:text-orange-500 dark:hover:bg-gray-700/50 transition-all backdrop-blur-sm border border-transparent hover:border-white/30 dark:hover:border-gray-600/50"
          >
            <div className="mr-3" style={orangeFilter}>
              <img src="/home.png" alt="Home" className="h-5 w-5" />
            </div>
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/students"
            className="flex items-center px-4 py-2 rounded hover:bg-white/50 hover:text-orange-500 dark:hover:bg-gray-700/50 transition-all backdrop-blur-sm border border-transparent hover:border-white/30 dark:hover:border-gray-600/50"
          >
            <div className="mr-3" style={orangeFilter}>
              <img src="/student.png" alt="Students" className="h-5 w-5" />
            </div>
            Students
          </Link>
        </li>
        <li>
          <Link
            to="/attendances"
            className="flex items-center px-4 py-2 rounded hover:bg-white/50 hover:text-orange-500 dark:hover:bg-gray-700/50 transition-all backdrop-blur-sm border border-transparent hover:border-white/30 dark:hover:border-gray-600/50"
          >
            <div className="mr-3" style={orangeFilter}>
              <img src="/calendar.png" alt="Attendance" className="h-5 w-5" />
            </div>
            Attendance
          </Link>
        </li>
        <li>
          <Link
            to="/courses"
            className="flex items-center px-4 py-2 rounded hover:bg-white/50 hover:text-orange-500 dark:hover:bg-gray-700/50 transition-all backdrop-blur-sm border border-transparent hover:border-white/30 dark:hover:border-gray-600/50"
          >
            <div className="mr-3" style={orangeFilter}>
              <img src="/training.png" alt="Courses" className="h-5 w-5" />
            </div>
            Courses
          </Link>
        </li>
        <li>
          <Link
            to="/marks"
            className="flex items-center px-4 py-2 rounded hover:bg-white/50 hover:text-orange-500 dark:hover:bg-gray-700/50 transition-all backdrop-blur-sm border border-transparent hover:border-white/30 dark:hover:border-gray-600/50"
          >
            <div className="mr-3" style={orangeFilter}>
              <img src="/paper.png" alt="Marks" className="h-5 w-5" />
            </div>
            Marks
          </Link>
        </li>
      </ul>
<div className="absolute bottom-8 w-full px-4">
  <div className="flex items-center justify-between w-full px-6 py-2 rounded text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-all backdrop-blur-sm bg-white/30 dark:bg-gray-700/30 border border-white/20 dark:border-gray-600/50">
    <span className="text-sm mr-4">By Ganesh R</span>
    <div style={orangeFilter}>
      <img 
        src="/signature.png" 
        alt="Signature" 
        className="h-8 w-auto transform scale-x-110" 
        style={{ minWidth: '80px' }}
      />
    </div>
  </div>
</div>
    </div>
  );
}

export default Sidebar;