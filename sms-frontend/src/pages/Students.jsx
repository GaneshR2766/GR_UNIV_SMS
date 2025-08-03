import React, { useEffect, useState } from "react";
import axios from "axios";
import StudentForm from "../components/StudentForm";
import { useNavigate } from "react-router-dom";

function Students() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedDept, setSelectedDept] = useState('');
  const [departments, setDepartments] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const navigate = useNavigate();
  
  const orangeFilter = {
    filter: 'brightness(0) saturate(100%) invert(61%) sepia(91%) saturate(1232%) hue-rotate(331deg) brightness(96%) contrast(91%)'
  };

  useEffect(() => {
    fetchStudents();
    fetchDepartments();
  }, []);

  const fetchStudents = () => {
    setIsLoading(true);
    axios
      .get("http://localhost:8080/api/students")
      .then((res) => {
        setStudents(res.data);
        calculateTopPerformers(res.data);
      })
      .catch((err) => console.error("Error fetching students:", err))
      .finally(() => setIsLoading(false));
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/courses");
      setDepartments(response.data);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const calculateTopPerformers = async (studentsList) => {
    try {
      // Fetch attendance and marks for all students
      const performanceData = await Promise.all(
        studentsList.map(async (student) => {
          if (student.name.includes("(evicted)")) return null;
          
          const [attendanceRes, marksRes] = await Promise.all([
            axios.get(`http://localhost:8080/api/attendance/student/${student.id}`),
            axios.get(`http://localhost:8080/api/marks/student/${student.id}/details`)
          ]);
          
          const attendance = attendanceRes.data;
          const marks = marksRes.data.marks;
          
          // Calculate attendance percentage
          const presentDays = attendance.filter(a => a.present).length;
          const attendancePercentage = attendance.length > 0 ? 
            (presentDays / attendance.length) * 100 : 0;
          
          // Calculate total marks
          const totalMarks = marks.reduce((sum, mark) => sum + (mark.marks || 0), 0);
          const marksPercentage = (totalMarks / 500) * 100;
          
          // Combined performance score (50% attendance, 50% marks)
          const performanceScore = (attendancePercentage * 0.5) + (marksPercentage * 0.5);
          
          return {
            ...student,
            attendancePercentage,
            totalMarks,
            performanceScore
          };
        })
      );
      
      // Filter out nulls (evicted students) and sort by performance score
      const validPerformers = performanceData.filter(p => p !== null);
      const sorted = validPerformers.sort((a, b) => b.performanceScore - a.performanceScore);
      
      // Take top 3 performers
      setTopPerformers(sorted.slice(0, 3));
    } catch (err) {
      console.error("Error calculating top performers:", err);
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = (data) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      let valA, valB;
      if (sortConfig.key === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortConfig.key === 'department') {
        valA = a.course?.name || '';
        valB = b.course?.name || '';
      } else if (sortConfig.key === 'email') {
        valA = a.email.toLowerCase();
        valB = b.email.toLowerCase();
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const SortButton = ({ sortKey, label }) => (
    <button
      onClick={() => requestSort(sortKey)}
      className={`px-3 py-1 rounded-lg backdrop-blur-sm border transition-all shadow-sm hover:shadow-md ${
        sortConfig.key === sortKey
          ? 'bg-orange-500/20 border-orange-500/40 text-orange-600 dark:text-orange-400'
          : 'bg-white/70 dark:bg-gray-700/70 border-white/30 dark:border-gray-600/50 text-gray-700 dark:text-gray-300'
      }`}
    >
      {label}
      {sortConfig.key === sortKey && (
        <span className="ml-1">
          {sortConfig.direction === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </button>
  );

  const filteredStudents = selectedDept
    ? students.filter(s => s.course?.name === selectedDept)
    : students;

  const sortedStudents = getSortedData(filteredStudents);

  const handleAddClick = () => {
    setSelectedStudent(null);
    setShowForm(true);
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setShowForm(true);
  };

  const handleEvict = (student) => {
    const updatedStudent = {
      ...student,
      name: `${student.name} (evicted)`,
    };

    setIsLoading(true);
    axios
      .put(`http://localhost:8080/api/students/${student.id}`, updatedStudent)
      .then(fetchStudents)
      .catch((err) => console.error("Error evicting student:", err))
      .finally(() => setIsLoading(false));
  };

  const handleNameClick = (studentId) => {
    navigate(`/students/${studentId}`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-orange-500 backdrop-blur-sm bg-white/30 dark:bg-gray-800/30 inline-flex items-center px-4 py-2 rounded-lg border border-white/20 dark:border-gray-700/50">
          <div className="mr-2" style={orangeFilter}>
            <img src="/student.png" alt="Students" className="h-7 w-7" />
          </div>
          Students List
        </h2>

        {!showForm && (
          <button
            onClick={handleAddClick}
            className="bg-orange-500/90 text-white px-4 py-2 rounded-lg hover:bg-orange-600/90 transition-all backdrop-blur-sm border border-orange-400/30 hover:border-orange-500/40 shadow-sm hover:shadow-md flex items-center justify-center gap-1.5"
            disabled={isLoading}
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Student
          </button>
        )}
      </div>

      {/* Top Performers Section */}
      {topPerformers.length > 0 && (
        <div className="mb-8 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 dark:from-orange-900/30 dark:to-yellow-900/30 p-6 rounded-xl border border-orange-400/20 dark:border-orange-700/50 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-orange-600 dark:text-orange-400 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Top Performers
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topPerformers.map((student, index) => (
              <div 
                key={student.id}
                className={`p-4 rounded-lg border backdrop-blur-sm ${
                  index === 0 
                    ? 'bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 border-yellow-500/40 shadow-lg' 
                    : 'bg-white/70 dark:bg-gray-800/70 border-white/30 dark:border-gray-700/50 shadow-md'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${
                    index === 0 
                      ? 'text-yellow-700 dark:text-yellow-300' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    Rank #{index + 1}
                  </span>
                  {index === 0 && (
                    <span className="bg-yellow-500/90 text-white text-xs px-2 py-1 rounded-full flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Top Performer
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-1">
                  {student.name}
                </h3>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {student.course?.name || 'N/A'}
                  </span>
                  <span className="font-bold">
                    {Math.round(student.performanceScore)}%
                  </span>
                </div>
                
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      index === 0 ? 'bg-yellow-500' : 'bg-orange-500'
                    }`}
                    style={{ width: `${student.performanceScore}%` }}
                  ></div>
                </div>
                
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {student.attendancePercentage.toFixed(1)}% Attendance • {student.totalMarks}/500 Marks
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Sorting Controls */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">
            Filter by Department:
          </label>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="border border-white/30 dark:border-gray-600/50 rounded-lg p-3 backdrop-blur-sm bg-white/70 dark:bg-gray-700/70 text-black dark:text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all w-full"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.name} className="bg-white dark:bg-gray-800">
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">
            Sort By:
          </label>
          <div className="flex gap-2">
            <SortButton sortKey="name" label="Name" />
            <SortButton sortKey="department" label="Department" />
            <SortButton sortKey="email" label="Email" />
          </div>
        </div>
      </div>

      {showForm && (
        <StudentForm
          selectedStudent={selectedStudent}
          onSuccess={() => {
            fetchStudents();
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {isLoading ? (
        <div className="text-center py-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-white/30 dark:border-gray-700/50">
          Loading students...
        </div>
      ) : (
        <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-lg backdrop-blur-sm border border-white/30 dark:border-gray-700/50 overflow-hidden mt-6">
          <table className="min-w-full">
            <thead>
              <tr className="bg-orange-500/90 text-white backdrop-blur-sm">
                <th className="py-3 px-6 text-left border-b border-white/20">ID</th>
                <th className="py-3 px-6 text-left border-b border-white/20">Name</th>
                <th className="py-3 px-6 text-left border-b border-white/20">Email</th>
                <th className="py-3 px-6 text-left border-b border-white/20">Course</th>
                <th className="py-3 px-6 text-left border-b border-white/20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.length > 0 ? (
                sortedStudents.map((student, index) => {
                  const isEvicted = student.name.includes("(evicted)");
                  const displayName = isEvicted 
                    ? student.name.replace("(evicted)", "") 
                    : student.name;
                  
                  return (
                    <tr
                      key={student.id}
                      className={`border-b border-white/20 dark:border-gray-700/50 ${
                        index % 2 === 0
                          ? "bg-white/50 dark:bg-gray-700/50"
                          : "bg-white/30 dark:bg-gray-800/30"
                      } hover:bg-white/70 dark:hover:bg-gray-700/70 transition-colors`}
                    >
                      <td className="py-3 px-6 dark:text-gray-300">{student.id}</td>
                      <td className="py-3 px-6 dark:text-gray-300">
                        <button
                          onClick={() => handleNameClick(student.id)}
                          className={`text-orange-500 hover:text-orange-600 hover:underline focus:outline-none ${
                            isEvicted ? "dark:text-gray-400" : ""
                          }`}
                        >
                          {displayName}
                          {isEvicted && (
                            <span className="text-gray-600 dark:text-gray-400 ml-1">
                              (evicted)
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-6 dark:text-gray-300">{student.email}</td>
                      <td className="py-3 px-6 dark:text-gray-300">
                        {student.course?.name || "—"}
                      </td>
                      <td className="py-3 px-6 flex gap-2">
                        <button
                          onClick={() => !isEvicted && handleEdit(student)}
                          className={`px-3 py-1 rounded-lg backdrop-blur-sm border transition-all shadow-sm hover:shadow-md ${
                            isEvicted
                              ? "bg-gray-300/30 text-gray-700 dark:text-gray-300 cursor-not-allowed border-gray-400/40"
                              : "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-400/20 hover:bg-orange-500/20 dark:hover:bg-orange-500/20"
                          }`}
                          disabled={isEvicted}
                        >
                          Edit
                        </button>

                        {isEvicted ? (
                          <button
                            disabled
                            className="bg-gray-300/30 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-lg cursor-not-allowed border border-gray-400/40 backdrop-blur-sm"
                          >
                            Evicted
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEvict(student)}
                            className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-lg backdrop-blur-sm border border-yellow-400/20 hover:bg-yellow-500/20 dark:hover:bg-yellow-500/20 transition-all shadow-sm hover:shadow-md"
                          >
                            Evict
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="py-6 text-center text-gray-500 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                  >
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Students;