import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function MarksPage() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [editMarks, setEditMarks] = useState([]);
  const [viewMarks, setViewMarks] = useState([]);
  const [totalMarks, setTotalMarks] = useState({});
  const [invalidMarks, setInvalidMarks] = useState({});
  const [emptyFields, setEmptyFields] = useState({});
  const [showToppersMarks, setShowToppersMarks] = useState(false);
  const [toppersWithMarks, setToppersWithMarks] = useState([]);
  const [sortBy, setSortBy] = useState('name'); // 'name' or 'marks'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const orangeFilter = {
    filter: 'brightness(0) saturate(100%) invert(61%) sepia(91%) saturate(1232%) hue-rotate(331deg) brightness(96%) contrast(91%)'
  };

  useEffect(() => {
    fetchData();
  }, []);

  const navigate = useNavigate();

  const getTopThreeStudents = () => {
    // Filter out evicted students first
    const nonEvictedStudents = students.filter(student => !student.name.includes("(evicted)"));
    
    // Sort non-evicted students by total marks in descending order
    const sortedStudents = [...nonEvictedStudents].sort((a, b) => {
      const totalA = totalMarks[a.id] || 0;
      const totalB = totalMarks[b.id] || 0;
      return totalB - totalA;
    });
    
    // Return top 3 non-evicted students with their rank
    return sortedStudents.slice(0, 3).map((student, index) => ({
      ...student,
      rank: index + 1,
      total: totalMarks[student.id] || 0
    }));
  };

  const fetchToppersMarks = async () => {
    try {
      const topStudents = getTopThreeStudents();
      const marksPromises = topStudents.map(student => 
        axios.get(`http://localhost:8080/api/marks/student/${student.id}/details`)
      );
      
      const marksResponses = await Promise.all(marksPromises);
      
      const toppersData = topStudents.map((student, index) => ({
        ...student,
        marks: marksResponses[index].data.marks
      }));
      
      setToppersWithMarks(toppersData);
      setShowToppersMarks(true);
    } catch (err) {
      console.error("Error fetching toppers marks:", err);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [studentsRes, deptsRes] = await Promise.all([
        axios.get('http://localhost:8080/api/students'),
        axios.get('http://localhost:8080/api/courses')
      ]);
      
      setStudents(studentsRes.data);
      setDepartments(deptsRes.data);
      
      const totals = {};
      for (const student of studentsRes.data) {
        const total = await axios.get(`http://localhost:8080/api/marks/student/${student.id}/total`);
        totals[student.id] = total.data;
      }
      setTotalMarks(totals);
      
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (student) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/marks/student/${student.id}/details`);
      setEditMarks(response.data.marks);
      setEditingStudent(response.data);
      // Initialize empty fields state
      const emptyFieldsObj = {};
      response.data.marks.forEach((mark, index) => {
        emptyFieldsObj[index] = mark.marks === null || mark.marks === undefined;
      });
      setEmptyFields(emptyFieldsObj);
    } catch (err) {
      console.error("Error fetching marks details:", err);
    }
  };

  const handleView = async (student) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/marks/student/${student.id}/details`);
      setViewMarks(response.data.marks);
      setViewingStudent(response.data);
    } catch (err) {
      console.error("Error fetching marks details:", err);
    }
  };

  const handleEditChange = (index, value) => {
    const newValue = value === '' ? null : parseInt(value);
    
    // Validate the input
    if (newValue !== null && (isNaN(newValue) || newValue < 0 || newValue > 100)) {
      setInvalidMarks(prev => ({ ...prev, [index]: true }));
      return;
    }
    
    setInvalidMarks(prev => ({ ...prev, [index]: false }));
    
    const updatedMarks = [...editMarks];
    updatedMarks[index].marks = newValue;
    setEditMarks(updatedMarks);
    
    // Update empty fields state
    setEmptyFields(prev => ({
      ...prev,
      [index]: newValue === null || newValue === undefined
    }));
  };

  const handleSave = async () => {
    // Check for any empty fields
    const hasEmptyFields = Object.values(emptyFields).some(Boolean);
    if (hasEmptyFields) {
      alert('Please enter 0 for any empty fields before saving.');
      return;
    }

    try {
      const updates = editMarks.map(mark => ({
        markId: mark.markId,
        studentId: editingStudent.studentId,
        subjectId: mark.subjectId,
        marks: mark.marks === null ? 0 : mark.marks
      }));

      await axios.put('http://localhost:8080/api/marks/bulk', updates);
      fetchData();
      setEditingStudent(null);
      setEmptyFields({});
    } catch (err) {
      console.error("Error updating marks:", err);
    }
  };

  const filteredStudents = (selectedDept 
    ? students.filter(s => s.course?.name === selectedDept)
    : [...students]
  ).sort((a, b) => {
    if (sortBy === 'name') {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    } else {
      const marksA = totalMarks[a.id] || 0;
      const marksB = totalMarks[b.id] || 0;
      return sortOrder === 'asc' ? marksA - marksB : marksB - marksA;
    }
  });


  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-orange-500 backdrop-blur-sm bg-white/30 dark:bg-gray-800/30 inline-flex items-center px-4 py-2 rounded-lg border border-white/20 dark:border-gray-700/50">
        <div className="mr-2" style={orangeFilter}>
          <img 
            src="/paper.png" 
            alt="Marks" 
            className="h-7 w-7"
          />
        </div>
        Student Marks
      </h1>
      
      {/* Toppers Section */}
      <div className="mb-8 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 dark:from-orange-900/30 dark:to-yellow-900/30 p-6 rounded-xl border border-orange-400/20 dark:border-orange-700/50 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-orange-600 dark:text-orange-400 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            Top Performers
          </h2>
          <button 
            onClick={fetchToppersMarks}
            className="bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-lg backdrop-blur-sm border border-orange-400/20 hover:bg-orange-500/20 dark:hover:bg-orange-500/20 transition-all shadow-sm hover:shadow-md flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Marks
          </button>
        </div>
        
        {getTopThreeStudents().length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getTopThreeStudents().map((student) => (
              <div 
                key={student.id}
                className={`p-4 rounded-lg border backdrop-blur-sm ${
                  student.rank === 1 
                    ? 'bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 border-yellow-500/40 shadow-lg' 
                    : 'bg-white/70 dark:bg-gray-800/70 border-white/30 dark:border-gray-700/50 shadow-md'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${
                    student.rank === 1 
                      ? 'text-yellow-700 dark:text-yellow-300' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    Rank #{student.rank}
                  </span>
                  {student.rank === 1 && (
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
                    {student.total} <span className="text-gray-500 text-xs">/500</span>
                  </span>
                </div>
                
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      student.rank === 1 ? 'bg-yellow-500' : 'bg-orange-500'
                    }`}
                    style={{ width: `${(student.total / 500) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-600 dark:text-gray-300">
            No eligible top performers found (all students may be evicted).
          </div>
        )}
      </div>

      {/* Department Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 dark:text-gray-300">
          Filter by Department:
        </label>
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="border border-white/30 dark:border-gray-600/50 rounded-lg p-3 backdrop-blur-sm bg-white/70 dark:bg-gray-700/70 text-black dark:text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
        >
          <option value="">All Departments</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.name} className="bg-white dark:bg-gray-800">
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Sort By:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded-lg p-2 bg-white dark:bg-gray-700 text-black dark:text-white"
          >
            <option value="name">Name</option>
            <option value="marks">Total Marks</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Order:</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border rounded-lg p-2 bg-white dark:bg-gray-700 text-black dark:text-white"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-white/30 dark:border-gray-700/50">
          Loading data...
        </div>
      ) : (
        <div>
          {/* Main Table */}
          <div className="overflow-x-auto mb-8">
            <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-lg backdrop-blur-sm border border-white/30 dark:border-gray-700/50 overflow-hidden">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-orange-500/90 text-white backdrop-blur-sm">
                    <th className="px-4 py-3 text-left border-b border-white/20">Student ID</th>
                    <th className="px-4 py-3 text-left border-b border-white/20">Name</th>
                    <th className="px-4 py-3 text-left border-b border-white/20">Department</th>
                    <th className="px-4 py-3 text-left border-b border-white/20">Total (out of 500)</th>
                    <th className="px-4 py-3 text-left border-b border-white/20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => {
                    const isEvicted = student.name.includes("(evicted)");
                    const displayName = isEvicted 
                      ? student.name.replace("(evicted)", "")
                      : student.name;
                    
                    return (
                      <tr key={student.id} className="border-b border-white/20 dark:border-gray-700/50 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-4 py-3 dark:text-gray-300">{student.id}</td>
                        <td className="px-4 py-3 dark:text-gray-300">
                          <button
                            onClick={() => navigate(`/students/${student.id}`)}
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
                        <td className="px-4 py-3 dark:text-gray-300">{student.course?.name || 'N/A'}</td>
                        <td className="px-4 py-3 dark:text-gray-300 w-64">
                          {totalMarks[student.id] !== undefined ? (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                  {totalMarks[student.id]}
                                </span>
                                <span className="text-xs text-gray-500">/500</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                                <div
                                  className="h-2.5 rounded-full transition-all"
                                  style={{
                                    width: `${(totalMarks[student.id] / 500) * 100}%`,
                                    backgroundColor:
                                      totalMarks[student.id] >= 375
                                        ? '#10B981' // green
                                        : totalMarks[student.id] >= 250
                                        ? '#F59E0B' // yellow
                                        : '#EF4444' // red
                                  }}
                                ></div>
                              </div>
                              <p className="text-sm text-gray-400">
                                {(totalMarks[student.id] / 500 * 100).toFixed(1)}%
                              </p>
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {isEvicted ? (
                              <button
                                disabled
                                className="bg-gray-300/30 text-gray-700 dark:text-gray-400 px-3 py-1 rounded-lg cursor-not-allowed border border-gray-400/40 backdrop-blur-sm"
                                title="Cannot edit evicted student"
                              >
                                Edit
                              </button>
                            ) : (
                              <button
                                onClick={() => handleEdit(student)}
                                className="bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-lg backdrop-blur-sm border border-orange-400/20 hover:bg-orange-500/20 dark:hover:bg-orange-500/20 transition-all shadow-sm hover:shadow-md"
                              >
                                Edit
                              </button>
                            )}

                            <button
                              onClick={() => handleView(student)}
                              className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg backdrop-blur-sm border border-blue-400/20 hover:bg-blue-500/20 dark:hover:bg-blue-500/20 transition-all shadow-sm hover:shadow-md"
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit Modal */}
          {editingStudent && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-xl shadow-2xl backdrop-blur-md border border-white/30 dark:border-gray-700/50 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-orange-500">
                  Edit Marks for {editingStudent.studentName}
                </h2>
                {editMarks.map((mark, index) => (
                  <div key={mark.subjectId} className="mb-4">
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                      {mark.subjectName}
                    </label>
                    <input
                      type="number"
                      value={mark.marks === null ? '' : mark.marks}
                      onChange={(e) => handleEditChange(index, e.target.value)}
                      className={`border ${
                        invalidMarks[index] 
                          ? 'border-red-500 dark:border-red-400' 
                          : 'border-white/30 dark:border-gray-600/50'
                      } rounded-lg p-3 backdrop-blur-sm bg-white/70 dark:bg-gray-700/70 text-black dark:text-white focus:ring-2 ${
                        invalidMarks[index] 
                          ? 'focus:ring-red-500/50 focus:border-red-500' 
                          : 'focus:ring-orange-500/50 focus:border-orange-500'
                      } transition-all w-full`}
                      min="0"
                      max="100"
                      placeholder={emptyFields[index] ? "Enter 0 if no marks" : ""}
                      onKeyDown={(e) => {
                        // Prevent typing non-numeric characters
                        if (!/[0-9]|Backspace|Delete|ArrowLeft|ArrowRight/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onBlur={() => {
                        // If field is left empty, set it to 0
                        if (mark.marks === null || mark.marks === undefined) {
                          handleEditChange(index, '0');
                        }
                      }}
                    />
                    {invalidMarks[index] && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                        Marks must be between 0 and 100
                      </p>
                    )}
                    {emptyFields[index] && (
                      <p className="text-yellow-600 dark:text-yellow-400 text-xs mt-1">
                        Please enter 0 if student has no marks for this subject
                      </p>
                    )}
                  </div>
                ))}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setEditingStudent(null);
                      setInvalidMarks({});
                      setEmptyFields({});
                    }}
                    className="bg-gray-500/90 text-white px-4 py-2 rounded-lg hover:bg-gray-600/90 transition-all backdrop-blur-sm border border-gray-400/30 hover:border-gray-500/40 shadow-sm hover:shadow-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={Object.values(invalidMarks).some(Boolean) || Object.values(emptyFields).some(Boolean)}
                    className={`${
                      Object.values(invalidMarks).some(Boolean) || Object.values(emptyFields).some(Boolean)
                        ? 'bg-gray-400/90 cursor-not-allowed'
                        : 'bg-orange-500/90 hover:bg-orange-600/90 hover:border-orange-500/40'
                    } text-white px-4 py-2 rounded-lg transition-all backdrop-blur-sm border border-orange-400/30 shadow-sm hover:shadow-md`}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* View Modal */}
          {viewingStudent && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl border border-white/30 dark:border-gray-700/50 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-6 text-orange-600 dark:text-orange-400 text-center">
                  Marks Breakdown – {viewingStudent.studentName}
                </h2>

                {viewMarks.length > 0 ? (
                  <div className="space-y-4">
                    {viewMarks.map((mark) => (
                      <div key={mark.subjectId}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {mark.subjectName}
                          </span>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {mark.marks ?? '0'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                          <div
                            className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(mark.marks || 0, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-600 dark:text-gray-300 mb-4">No marks data available.</p>
                )}

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setViewingStudent(null)}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-all border border-orange-400/30 hover:border-orange-500 shadow-sm hover:shadow-md"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Toppers Marks Modal */}
          {showToppersMarks && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl border border-white/30 dark:border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    Top Performers Marks Details
                  </h2>
                  <button
                    onClick={() => setShowToppersMarks(false)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {toppersWithMarks.length > 0 ? (
                  <div className="space-y-6">
                    {toppersWithMarks.map((student) => (
                      <div key={student.id} className="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg border border-white/30 dark:border-gray-700/50">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                            {student.rank}. {student.name}
                          </h3>
                          <span className="bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-lg text-sm">
                            Total: {student.total}/500
                          </span>
                        </div>

                        <div className="space-y-3">
                          {student.marks.map((mark) => (
                            <div key={mark.subjectId}>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                  {mark.subjectName}
                                </span>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                  {mark.marks ?? '0'}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div
                                  className="h-2.5 rounded-full"
                                  style={{ 
                                    width: `${Math.min(mark.marks || 0, 100)}%`,
                                    backgroundColor: 
                                      mark.marks >= 80 
                                        ? '#10B981' // green
                                        : mark.marks >= 50 
                                        ? '#F59E0B' // yellow
                                        : '#EF4444' // red
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-600 dark:text-gray-300">
                    No eligible top performers found (all students may be evicted).
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MarksPage;