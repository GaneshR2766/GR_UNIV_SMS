import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

// CSS filter to convert black to orange-500 (#f97316)
const whiteFilter = {
  filter: 'brightness(0) saturate(100%) invert(100%)'
};

const orangeFilter = {
  filter: 'brightness(0) saturate(100%) invert(61%) sepia(91%) saturate(1232%) hue-rotate(331deg) brightness(96%) contrast(91%)'
};

function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setIsLoading(true);
        const [studentRes, attendanceRes, marksRes] = await Promise.all([
          axios.get(`http://localhost:8080/api/students/${id}`),
          axios.get(`http://localhost:8080/api/attendance/student/${id}`),
          axios.get(`http://localhost:8080/api/marks/student/${id}/details`)
        ]);
        
        setStudent(studentRes.data);
        setAttendance(attendanceRes.data);
        setMarks(marksRes.data.marks);
      } catch (err) {
        console.error("Error fetching student data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [id]);

  const calculateAttendancePercentage = () => {
    if (attendance.length === 0) return 0;
    const presentDays = attendance.filter(a => a.present).length;
    return Math.round((presentDays / attendance.length) * 100);
  };

  const calculateTotalMarks = () => {
    return marks.reduce((total, mark) => total + (mark.marks || 0), 0);
  };

  const isEvicted = student?.name?.includes("(evicted)");
  const displayName = isEvicted 
    ? student.name.replace("(evicted)", "")
    : student?.name;

  if (isLoading) {
    return (
      <div className="text-center py-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-white/30 dark:border-gray-700/50">
        Loading student details...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-white/30 dark:border-gray-700/50">
        Student not found
      </div>
    );
  }

  return (
    <div className={`p-6 ${isEvicted ? "bg-gray-100/50 dark:bg-gray-900/50" : ""}`}>
      <div className="flex justify-between items-center mb-6">
        <div className={`text-3xl font-bold ${isEvicted ? "text-gray-600 dark:text-gray-400" : "text-orange-500"} backdrop-blur-sm ${isEvicted ? "bg-gray-300/30 dark:bg-gray-700/30" : "bg-white/30 dark:bg-gray-800/30"} inline-flex items-center px-4 py-2 rounded-lg border ${isEvicted ? "border-gray-300/20 dark:border-gray-600/50" : "border-white/20 dark:border-gray-700/50"}`}>
          <div className="mr-2" style={isEvicted ? {} : orangeFilter}>
            <img 
              src={isEvicted ? "/blocked.png" : "/student.png"} 
              alt={isEvicted ? "Evicted" : "Student"} 
              className="h-6 w-6" 
            />
          </div>
          {isEvicted ? "Evicted Student" : "Student Details"}
        </div>
        <button
  onClick={() => navigate(-1)}
  className={`${
    isEvicted 
      ? "bg-gray-600/90 hover:bg-gray-700/90 border-gray-500/40" 
      : "bg-gray-500/90 hover:bg-gray-600/90 border-gray-400/30"
  } text-white px-4 py-2 rounded-lg transition-all backdrop-blur-sm border shadow-sm hover:shadow-md flex items-center`}
>
  {/* Larger, bolder back arrow */}
  <svg 
    className="h-5 w-5 mr-1.5" 
    viewBox="0 0 20 20" 
    fill="currentColor"
    aria-hidden="true"
  >
    <path 
      fillRule="evenodd" 
      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" 
      clipRule="evenodd" 
    />
  </svg>
  Back to List
</button>
      </div>

      {/* Basic Info & Course */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className={`${isEvicted ? "bg-gray-200/70 dark:bg-gray-700/70" : "bg-white/70 dark:bg-gray-800/70"} rounded-xl shadow-lg backdrop-blur-sm border ${isEvicted ? "border-gray-300/30 dark:border-gray-600/50" : "border-white/30 dark:border-gray-700/50"} p-6`}>
          <div className={`text-xl font-semibold ${isEvicted ? "text-gray-600 dark:text-gray-400" : "text-orange-500"} mb-4 flex items-center`}>
            <div className="mr-2" style={isEvicted ? {} : orangeFilter}>
              <img src="/info.png" alt="Info" className="h-5 w-5" />
            </div>
            {isEvicted ? "Evicted Student Info" : "Basic Information"}
          </div>
          <p className="text-xl mb-2">
            <span className="font-semibold">ID:</span> {student.id}
          </p>
          <p className="text-2xl font-bold mb-2">
            <span className={isEvicted ? "text-gray-700 dark:text-gray-300" : "text-orange-600"}>Name:</span> {displayName}
            {isEvicted && (
              <span className="text-gray-600 dark:text-gray-400 ml-2">
                (evicted)
              </span>
            )}
          </p>
          <p className="text-lg mb-2">
            <span className="font-semibold">Email:</span> {student.email}
          </p>
        </div>

        <div className={`${isEvicted ? "bg-gray-200/70 dark:bg-gray-700/70" : "bg-white/70 dark:bg-gray-800/70"} rounded-xl shadow-lg backdrop-blur-sm border ${isEvicted ? "border-gray-300/30 dark:border-gray-600/50" : "border-white/30 dark:border-gray-700/50"} p-6`}>
          <div className={`text-xl font-semibold ${isEvicted ? "text-gray-600 dark:text-gray-400" : "text-orange-500"} mb-4 flex items-center`}>
            <div className="mr-2" style={isEvicted ? {} : orangeFilter}>
              <img src="/training.png" alt="Course" className="h-5 w-5" />
            </div>
            {isEvicted ? "Previous Course" : "Course Details"}
          </div>
          <p className="text-lg mb-2">
            <span className="font-semibold">Department:</span> {student.course?.name || "N/A"}
          </p>
          <p className="font-semibold mb-2">Subjects:</p>
          <ul className="list-disc list-inside ml-4">
            {student.course?.subjects?.length > 0 ? (
              student.course.subjects.map((sub) => (
                <li key={sub.id} className="text-base">{sub.name}</li>
              ))
            ) : (
              <li className="text-base text-gray-500">No subjects assigned</li>
            )}
          </ul>
        </div>
      </div>

      {/* Performance Section */}
{/* Combined Performance Section */}
<div className={`${isEvicted ? "bg-gray-200/70 dark:bg-gray-700/70" : "bg-white/70 dark:bg-gray-800/70"} rounded-xl shadow-lg backdrop-blur-sm border ${isEvicted ? "border-gray-300/30 dark:border-gray-600/50" : "border-white/30 dark:border-gray-700/50"} p-6 mb-6`}>
  <div className={`text-xl font-semibold ${isEvicted ? "text-gray-600 dark:text-gray-400" : "text-orange-500"} mb-4 flex items-center`}>
    <div className="mr-2" style={isEvicted ? {} : orangeFilter}>
      <img src="/performance.png" alt="Performance" className="h-5 w-5" />
    </div>
    {isEvicted ? "Previous Performance" : "Performance"}
  </div>

  {/* Card-based Performance Highlights */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
    {/* Attendance Card */}
    <div className={`p-4 rounded-lg border backdrop-blur-sm ${
      isEvicted ? 'bg-gray-300/70 dark:bg-gray-600/70 border-gray-400/30 dark:border-gray-500/50' :
      calculateAttendancePercentage() >= 90 
        ? 'bg-gradient-to-br from-green-400/20 to-green-600/20 border-green-500/40 shadow-lg' 
        : 'bg-white/70 dark:bg-gray-800/70 border-white/30 dark:border-gray-700/50 shadow-md'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium ${
          isEvicted ? 'text-gray-700 dark:text-gray-300' :
          calculateAttendancePercentage() >= 90 
            ? 'text-green-700 dark:text-green-300' 
            : 'text-gray-700 dark:text-gray-300'
        }`}>
          Attendance
        </span>
        {!isEvicted && calculateAttendancePercentage() >= 90 && (
          <span className="bg-green-500/90 text-white text-xs px-2 py-1 rounded-full flex items-center">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Excellent
          </span>
        )}
      </div>
      
      <div className="flex justify-between items-center text-sm mb-2">
        <span className={`${isEvicted ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'}`}>
          Current Percentage
        </span>
        <span className={`font-bold ${isEvicted ? 'text-gray-700 dark:text-gray-300' : ''}`}>
          {calculateAttendancePercentage().toFixed(1)}%
        </span>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${
            isEvicted ? 'bg-gray-500' :
            calculateAttendancePercentage() >= 90 ? 'bg-green-500' : 'bg-orange-500'
          }`}
          style={{ width: `${calculateAttendancePercentage()}%` }}
        ></div>
      </div>
      
      <div className={`mt-2 text-xs ${isEvicted ? 'text-gray-500 dark:text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
        {attendance.filter(a => a.present).length} present out of {attendance.length} days
      </div>
    </div>

    {/* Marks Card */}
    <div className={`p-4 rounded-lg border backdrop-blur-sm ${
      isEvicted ? 'bg-gray-300/70 dark:bg-gray-600/70 border-gray-400/30 dark:border-gray-500/50' :
      (calculateTotalMarks() / 500) >= 0.75
        ? 'bg-gradient-to-br from-blue-400/20 to-blue-600/20 border-blue-500/40 shadow-lg' 
        : 'bg-white/70 dark:bg-gray-800/70 border-white/30 dark:border-gray-700/50 shadow-md'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium ${
          isEvicted ? 'text-gray-700 dark:text-gray-300' :
          (calculateTotalMarks() / 500) >= 0.75
            ? 'text-blue-700 dark:text-blue-300' 
            : 'text-gray-700 dark:text-gray-300'
        }`}>
          Academic Performance
        </span>
        {!isEvicted && (calculateTotalMarks() / 500) >= 0.75 && (
          <span className="bg-blue-500/90 text-white text-xs px-2 py-1 rounded-full flex items-center">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Top Performer
          </span>
        )}
      </div>
      
      <div className="flex justify-between items-center text-sm mb-2">
        <span className={`${isEvicted ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'}`}>
          Total Marks
        </span>
        <span className={`font-bold ${isEvicted ? 'text-gray-700 dark:text-gray-300' : ''}`}>
          {calculateTotalMarks()} / 500
        </span>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${
            isEvicted ? 'bg-gray-500' :
            (calculateTotalMarks() / 500) >= 0.75 ? 'bg-blue-500' : 'bg-orange-500'
          }`}
          style={{ width: `${(calculateTotalMarks() / 500) * 100}%` }}
        ></div>
      </div>
      
      <div className={`mt-2 text-xs ${isEvicted ? 'text-gray-500 dark:text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
        {Math.round((calculateTotalMarks() / 500) * 100)}% of total possible marks
      </div>
    </div>
  </div>

  
</div>

      {/* Marks Section */}
      {!isEvicted && (
        <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-lg backdrop-blur-sm border border-white/30 dark:border-gray-700/50 p-6 mb-6">
          <div className="text-xl font-semibold text-orange-500 mb-4 flex items-center">
            <div className="mr-2" style={orangeFilter}>
              <img src="/paper.png" alt="Marks" className="h-5 w-5" />
            </div>
            Current Marks
          </div>
          {marks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-orange-500/10 backdrop-blur-sm">
                    <th className="px-4 py-3 text-left border-b border-white/20 dark:border-gray-600/50">Subject</th>
                    <th className="px-4 py-3 text-left border-b border-white/20 dark:border-gray-600/50">Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {marks.map((mark) => (
                    <tr key={mark.subjectId} className="border-b border-white/20 dark:border-gray-700/50 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3">{mark.subjectName}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${mark.marks >= 50 ? 'text-green-600' : 'text-red-500'}`}>
                              {mark.marks ?? "N/A"}
                            </span>
                            {typeof mark.marks === "number" && (
                              <span className="text-xs text-gray-500">/100</span>
                            )}
                          </div>
                          {typeof mark.marks === "number" && (
                            <>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                                <div
                                  className="h-2.5 rounded-full transition-all"
                                  style={{
                                    width: `${mark.marks}%`,
                                    backgroundColor:
                                      mark.marks >= 75 ? "#10B981" :
                                      mark.marks >= 50 ? "#F59E0B" : "#EF4444",
                                  }}
                                ></div>
                              </div>
                              <p className="text-sm text-gray-400">{mark.marks}%</p>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-lg border border-white/30 dark:border-gray-600/50">
              <p className="text-gray-500">No marks records found</p>
            </div>
          )}
        </div>
      )}

      {/* Attendance Records */}
      <div className={`${isEvicted ? "bg-gray-200/70 dark:bg-gray-700/70" : "bg-white/70 dark:bg-gray-800/70"} rounded-xl shadow-lg backdrop-blur-sm border ${isEvicted ? "border-gray-300/30 dark:border-gray-600/50" : "border-white/30 dark:border-gray-700/50"} p-6`}>
        <div className={`text-xl font-semibold ${isEvicted ? "text-gray-600 dark:text-gray-400" : "text-orange-500"} mb-4 flex items-center`}>
          <div className="mr-2" style={isEvicted ? {} : orangeFilter}>
            <img src="/calendar.png" alt="Attendance" className="h-5 w-5" />
          </div>
          {isEvicted ? "Previous Attendance" : "Attendance Records"}
        </div>
        {attendance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className={`${isEvicted ? "bg-gray-300/10 dark:bg-gray-600/10" : "bg-orange-500/10"} backdrop-blur-sm`}>
                  <th className="px-4 py-3 text-left border-b border-white/20 dark:border-gray-600/50">Date</th>
                  <th className="px-4 py-3 text-left border-b border-white/20 dark:border-gray-600/50">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => (
                  <tr key={record.id} className="border-b border-white/20 dark:border-gray-700/50 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {record.present ? (
                        <span className={`font-semibold px-2 py-1 rounded border ${isEvicted ? "text-gray-400 bg-gray-400/10 border-gray-400/20" : "text-green-600 bg-green-500/10 border-green-400/20"}`}>
                          Present
                        </span>
                      ) : (
                        <span className={`font-semibold px-2 py-1 rounded border ${isEvicted ? "text-gray-500 bg-gray-500/10 border-gray-500/20" : "text-red-500 bg-red-500/10 border-red-400/20"}`}>
                          Absent
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-lg border border-white/30 dark:border-gray-600/50">
            <p className="text-gray-500">No attendance records found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDetails;