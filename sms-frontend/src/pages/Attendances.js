import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Attendances({ attendances = [], selectedDate, onUpdate }) {
  const [editingId, setEditingId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [topAttenders, setTopAttenders] = useState([]);
  const [showTopAttenders, setShowTopAttenders] = useState(false);
  const navigate = useNavigate();

  const orangeFilter = {
    filter: 'brightness(0) saturate(100%) invert(61%) sepia(91%) saturate(1232%) hue-rotate(331deg) brightness(96%) contrast(91%)'
  };

  useEffect(() => {
    // Fetch departments when component mounts
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/courses');
        setDepartments(response.data);
      } catch (err) {
        console.error("Error fetching departments:", err);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    // Calculate top attenders whenever attendances change
    if (attendances.length > 0) {
      calculateTopAttenders();
    }
  }, [attendances]);

  const calculateTopAttenders = () => {
    // Group attendance by student
    const studentAttendance = {};
    
    attendances.forEach(attendance => {
      if (!attendance.student) return;
      
      const studentId = attendance.student.id;
      if (!studentAttendance[studentId]) {
        studentAttendance[studentId] = {
          student: attendance.student,
          presentCount: 0,
          totalCount: 0
        };
      }
      
      studentAttendance[studentId].totalCount++;
      if (attendance.present) {
        studentAttendance[studentId].presentCount++;
      }
    });
    
    // Calculate attendance percentage and sort
    const studentsWithAttendance = Object.values(studentAttendance).map(item => ({
      ...item.student,
      presentCount: item.presentCount,
      totalCount: item.totalCount,
      attendancePercentage: (item.presentCount / item.totalCount) * 100
    }));
    
    // Sort by attendance percentage (descending)
    const sorted = studentsWithAttendance.sort((a, b) => b.attendancePercentage - a.attendancePercentage);
    
    // Take top 3
    setTopAttenders(sorted.slice(0, 3));
  };

  const formatDate = (dateStr) => {
    try {
      return new Intl.DateTimeFormat("en-GB").format(new Date(dateStr));
    } catch {
      return dateStr;
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
        valA = a.student?.name?.toLowerCase() || '';
        valB = b.student?.name?.toLowerCase() || '';
      } else if (sortConfig.key === 'date') {
        valA = new Date(a.date);
        valB = new Date(b.date);
      } else if (sortConfig.key === 'department') {
        valA = a.student?.course?.name || '';
        valB = b.student?.course?.name || '';
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const SortButton = ({ sortKey, label }) => (
    <button
      onClick={() => requestSort(sortKey)}
      className={`px-3 py-1.5 rounded-lg backdrop-blur-sm border transition-all shadow-sm hover:shadow-md ${
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

  const filteredByDate = selectedDate
    ? attendances.filter(a => formatDate(a.date) === formatDate(selectedDate))
    : attendances;

  const filteredByDept = selectedDept
    ? filteredByDate.filter(a => a.student?.course?.name === selectedDept)
    : filteredByDate;

  const sortedData = getSortedData(filteredByDept);

  const handleUpdate = async (id, present) => {
    setIsUpdating(true);
    try {
      await axios.put(`http://localhost:8080/api/attendance/${id}`, null, {
        params: { present }
      });
      onUpdate();
      setEditingId(null);
    } catch (err) {
      console.error("Error updating attendance:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNameClick = (studentId) => {
    navigate(`/students/${studentId}`);
  };

  const fetchAttendanceDetails = async (studentId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/attendance/student/${studentId}`);
      return response.data;
    } catch (err) {
      console.error("Error fetching attendance details:", err);
      return null;
    }
  };

  const handleViewTopAttenders = async () => {
    setShowTopAttenders(true);
  };

  return (
    <div className="p-4">


      {/* Top Attenders Section */}
      <div className="mb-8 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 dark:from-orange-900/30 dark:to-yellow-900/30 p-6 rounded-xl border border-orange-400/20 dark:border-orange-700/50 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-orange-600 dark:text-orange-400 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
            </svg>
            Top Attenders
          </h2>
          <button 
            onClick={handleViewTopAttenders}
            className="bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-lg backdrop-blur-sm border border-orange-400/20 hover:bg-orange-500/20 dark:hover:bg-orange-500/20 transition-all shadow-sm hover:shadow-md flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Details
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topAttenders.map((student, index) => (
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
                    Best Attendance
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
                  {student.attendancePercentage.toFixed(1)}%
                </span>
              </div>
              
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    index === 0 ? 'bg-yellow-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${student.attendancePercentage}%` }}
                ></div>
              </div>
              
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {student.presentCount} present out of {student.totalCount} days
              </div>
            </div>
          ))}
        </div>
      </div>
      <h2 className="text-2xl font-bold text-orange-500 backdrop-blur-sm bg-white/30 dark:bg-gray-800/30 inline-flex items-center px-4 py-2 rounded-lg border border-white/20 dark:border-gray-700/50 mb-4">
        <div className="mr-2" style={orangeFilter}>
          <img src="/calendar.png" alt="Attendance" className="h-6 w-6" />
        </div>
        Attendance {selectedDate ? `on ${formatDate(selectedDate)}` : ''}
      </h2>
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
            <SortButton sortKey="date" label="Date" />
            <SortButton sortKey="department" label="Department" />
          </div>
        </div>
      </div>

      {sortedData.length === 0 ? (
        <p className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm p-4 rounded-lg border border-white/30 dark:border-gray-700/50">
          No attendance records found.
        </p>
      ) : (
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 dark:border-gray-700/50 overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-orange-500/90 text-white backdrop-blur-sm">
                <th className="px-4 py-3 border-b border-white/20">ID</th>
                <th className="px-4 py-3 border-b border-white/20">Date</th>
                <th className="px-4 py-3 border-b border-white/20">Student</th>
                <th className="px-4 py-3 border-b border-white/20">Department</th>
                <th className="px-4 py-3 border-b border-white/20">Status</th>
                <th className="px-4 py-3 border-b border-white/20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((a) => {
                const isEvicted = a.student?.name?.includes("(evicted)");
                const displayName = isEvicted 
                  ? a.student.name.replace("(evicted)", "")
                  : a.student?.name || "Unknown";

                return (
                  <tr 
                    key={a.id} 
                    className="border-b border-white/20 dark:border-gray-700/50 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-4 py-3">{a.id}</td>
                    <td className="px-4 py-3">{formatDate(a.date)}</td>
                    <td className="px-4 py-3">
                      {a.student?.id ? (
                        <button
                          onClick={() => handleNameClick(a.student.id)}
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
                      ) : (
                        "Unknown"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {a.student?.course?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === a.id ? (
                        <select
                          value={a.present}
                          onChange={(e) => handleUpdate(a.id, e.target.value === 'true')}
                          className="border border-orange-300/50 dark:border-orange-400/50 rounded-lg p-2 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                          disabled={isUpdating || isEvicted}
                        >
                          <option value="true" className="bg-white dark:bg-gray-800">Present</option>
                          <option value="false" className="bg-white dark:bg-gray-800">Absent</option>
                        </select>
                      ) : a.present ? (
                        <span className="text-green-600 font-semibold bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-400/20">
                          Present
                        </span>
                      ) : (
                        <span className="text-red-500 font-semibold bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-400/20">
                          Absent
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEvicted ? (
                        <button
                          disabled
                          className="bg-gray-300/30 text-gray-700 dark:text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed border border-gray-400/40 backdrop-blur-sm"
                          title="Cannot edit evicted student's attendance"
                        >
                          Edit
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingId(a.id)}
                          className="bg-orange-500/10 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-lg backdrop-blur-sm border border-orange-400/20 hover:bg-orange-500/20 dark:hover:bg-orange-500/20 transition-all shadow-sm hover:shadow-md font-medium"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Top Attenders Modal */}
      {showTopAttenders && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-start pt-16 p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl border border-white/30 dark:border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-orange-600 dark:text-orange-400">
                Top Attenders Details
              </h2>
              <button
                onClick={() => setShowTopAttenders(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {topAttenders.map((student) => (
                <div key={student.id} className="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg border border-white/30 dark:border-gray-700/50">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                        {student.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {student.course?.name || 'N/A'} • Rank #{topAttenders.indexOf(student) + 1}
                      </p>
                    </div>
                    <span className="bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-lg text-sm">
                      {student.attendancePercentage.toFixed(1)}% Attendance
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attendance Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Present:</span>
                          <span className="text-sm font-medium">{student.presentCount} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Absent:</span>
                          <span className="text-sm font-medium">{student.totalCount - student.presentCount} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Total Days:</span>
                          <span className="text-sm font-medium">{student.totalCount} days</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attendance Progress</h4>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div
                          className="h-2.5 rounded-full"
                          style={{ 
                            width: `${student.attendancePercentage}%`,
                            backgroundColor: 
                              student.attendancePercentage >= 90 
                                ? '#10B981' // green
                                : student.attendancePercentage >= 75 
                                ? '#F59E0B' // yellow
                                : '#EF4444' // red
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Attendances;
