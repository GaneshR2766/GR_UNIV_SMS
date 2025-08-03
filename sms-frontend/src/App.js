import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Students from './pages/Students';
import CoursePage from './pages/CoursePage';
import AttendanceCalendar from './components/AttendanceCalendar';
import MarksPage from './pages/MarksPage';
import { Link } from 'react-router-dom';
import SearchBar from './components/SearchBar';
import StudentDetails from './components/StudentDetails';
import CourseDetails from './components/CourseDetails';

// CSS filters
const orangeFilter = {
  filter: 'brightness(0) saturate(100%) invert(61%) sepia(91%) saturate(1232%) hue-rotate(331deg) brightness(96%) contrast(91%)'
};

const whiteFilter = {
  filter: 'brightness(0) saturate(100%) invert(100%)'
};

function Dashboard() {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-orange-500">Student Management Dashboard</h1>
      <p className="text-gray-600 dark:text-gray-300 mt-2">Welcome, Admin!</p>
      <SearchBar />
      
      <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg mt-6">
        <div className="flex items-center">
          <div className="mr-2" style={orangeFilter}>
            <img src="/pin.png" alt="Notes" className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-yellow-700 dark:text-yellow-300">Notes</h2>
        </div>
        <ul className="list-disc pl-5 mt-2 text-gray-700 dark:text-gray-200">
          <li>Have to add courses first to add subjects.</li>
          <li>Mark attendance daily to ensure accurate records.</li>
          <li>Use the marks page to view and analyze student performance.</li>
        </ul>
      </div>

      <div className="mt-6 text-center italic text-gray-600 dark:text-gray-300">
        "Education is the most powerful weapon which you can use to change the world." – Nelson Mandela
      </div>
    </div>
  );
}

function App() {
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem("loggedIn") === "true");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const handleLogin = () => {
    localStorage.setItem("loggedIn", "true");
    setLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    setLoggedIn(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        !e.target.closest('#sidebar-toggle')
      ) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white relative">
        {loggedIn && <Sidebar isOpen={sidebarOpen} sidebarRef={sidebarRef} />}

        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"></div>
        )}

        <header className="fixed top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-gray-800/80 shadow-lg backdrop-blur-md border-b border-white/10 dark:border-gray-700/50 z-50">
          <div className="flex items-center space-x-4">
            {loggedIn && (
                        <button
            id="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-xl text-orange-500 hover:text-orange-600 z-50 bg-white/30 dark:bg-gray-700/30 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/20 dark:border-gray-600/50 transition-all"
            title="Menu"
          >
            ☰ Menu
          </button>
            )}
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/logo.png"
                alt="School Logo"
                className="h-8 w-8 object-contain"
              />
              <span className="text-2xl font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                GR UNIVERSITY SMS
              </span>
            </Link>
          </div>

          {loggedIn && (
            <div className="flex items-center space-x-3">
              <label 
                title="Profile"
                className="flex items-center bg-white/40 dark:bg-gray-700/40 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/30 dark:border-gray-600/50 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all"
              >
                <div className="mr-2" style={whiteFilter}>
                  <img src="/user.png" alt="Admin" className="h-5 w-5" />
                </div>
                ADMIN
              </label>
              <button
                onClick={handleLogout}
                className="flex items-center bg-red-500/90 text-white px-3 py-1 rounded-lg hover:bg-red-600/90 transition-all backdrop-blur-sm border border-red-400/20 hover:border-red-500/30"
              >
                <div className="mr-2" style={whiteFilter}>
                  <img src="/logout.png" alt="Logout" className="h-5 w-5" />
                </div>
                Logout
              </button>
            </div>
          )}
        </header>

        <main className="pt-20 p-4 relative z-10">
          <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-lg backdrop-blur-sm border border-white/30 dark:border-gray-700/50 p-6">
            <Routes>
              <Route
                path="/"
                element={loggedIn ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />}
              />
              <Route path="/dashboard" element={loggedIn ? <Dashboard /> : <Navigate to="/" />} />
              <Route path="/students" element={loggedIn ? <Students /> : <Navigate to="/" />} />
              <Route path="/attendances" element={loggedIn ? <AttendanceCalendar /> : <Navigate to="/" />} />
              <Route path="/courses" element={loggedIn ? <CoursePage /> : <Navigate to="/" />} />
              <Route path="/courses/:id" element={<CourseDetails />} />
              <Route path="/marks" element={loggedIn ? <MarksPage /> : <Navigate to="/" />} />
              <Route path="/students/:id" element={<StudentDetails />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;