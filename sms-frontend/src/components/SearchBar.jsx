import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const menuSuggestions = [
  { label: 'Students', path: '/students', icon: 'student.png' },
  { label: 'Attendance', path: '/attendances', icon: 'calendar.png' },
  { label: 'Courses', path: '/courses', icon: 'training.png' },
  { label: 'Marks', path: '/marks', icon: 'paper.png' }
];

// CSS filter to convert black to orange-500 (#f97316)
const orangeFilter = {
  filter: 'brightness(0) saturate(100%) invert(61%) sepia(91%) saturate(1232%) hue-rotate(331deg) brightness(96%) contrast(91%)'
};

function SearchBar() {
  const [query, setQuery] = useState('');
  const [studentMatches, setStudentMatches] = useState([]);
  const [courseMatches, setCourseMatches] = useState([]);
  const [menuMatches, setMenuMatches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim() === '') {
      setStudentMatches([]);
      setCourseMatches([]);
      setMenuMatches([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      // Menu matches
      const filteredMenus = menuSuggestions.filter(menu =>
        menu.label.toLowerCase().includes(query.toLowerCase())
      );
      setMenuMatches(filteredMenus);

      // Student matches
      axios.get('http://localhost:8080/api/students')
        .then(res => {
          const matches = res.data.filter(s =>
            s.name.toLowerCase().includes(query.toLowerCase())
          );
          setStudentMatches(matches);
        })
        .catch(err => console.error("Error fetching students:", err));

      // Course matches
      axios.get('http://localhost:8080/api/courses')
        .then(res => {
          const matches = res.data.filter(c =>
            c.name.toLowerCase().includes(query.toLowerCase())
          );
          setCourseMatches(matches);
        })
        .catch(err => console.error("Error fetching courses:", err));
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleNavigate = (item) => {
    if (typeof item === 'string') {
      navigate(item); // Menu path
    } else if (item?.type === 'student') {
      navigate(`/students/${item.id}`);
    } else if (item?.type === 'course') {
      navigate(`/courses/${item.id}`);
    }
    setQuery('');
    setStudentMatches([]);
    setCourseMatches([]);
    setMenuMatches([]);
  };

  return (
    <div className="relative max-w-md w-full mx-auto mt-4">
      <div className="relative">
        <input
          type="text"
          value={query}
          placeholder="Search students, courses, or sections..."
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-orange-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 dark:bg-gray-800 dark:text-white dark:border-gray-600"
        />
        <div className="absolute left-3 top-2.5" style={orangeFilter}>
          <img 
            src="/search.png" 
            alt="Search" 
            className="h-5 w-5"
          />
        </div>
      </div>

      {(query && (studentMatches.length > 0 || courseMatches.length > 0 || menuMatches.length > 0)) && (
        <div className="absolute z-50 w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg mt-1 shadow-md max-h-60 overflow-auto">
          {studentMatches.map(s => (
            <div
              key={`student-${s.id}`}
              onClick={() => handleNavigate({ id: s.id, type: 'student' })}
              className="px-4 py-2 hover:bg-orange-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700 flex items-center"
            >
              <div className="mr-2" style={orangeFilter}>
                <img src="/student.png" alt="Student" className="h-5 w-5" />
              </div>
              {s.name}
            </div>
          ))}

          {courseMatches.map(c => (
            <div
              key={`course-${c.id}`}
              onClick={() => handleNavigate({ id: c.id, type: 'course' })}
              className="px-4 py-2 hover:bg-orange-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700 flex items-center"
            >
              <div className="mr-2" style={orangeFilter}>
                <img src="/training.png" alt="Course" className="h-5 w-5" />
              </div>
              {c.name}
            </div>
          ))}

          {menuMatches.map((menu, idx) => (
            <div
              key={`menu-${idx}`}
              onClick={() => handleNavigate(menu.path)}
              className="px-4 py-2 hover:bg-orange-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700 flex items-center"
            >
              <div className="mr-2" style={orangeFilter}>
                <img src={menu.icon} alt={menu.label} className="h-5 w-5" />
              </div>
              {menu.label}
            </div>
          ))}
        </div>
      )}

      {query && studentMatches.length === 0 && courseMatches.length === 0 && menuMatches.length === 0 && (
        <div className="absolute z-50 w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg mt-1 shadow-md">
          <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
            No matches. Try typing a student, course name, or keywords like Students, Courses, Attendance, Marks.
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchBar;