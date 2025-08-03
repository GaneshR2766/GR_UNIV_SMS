// pages/CoursePage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

function CoursePage() {
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [customSubjects, setCustomSubjects] = useState(["", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const orangeFilter = {
  filter: 'brightness(0) saturate(100%) invert(61%) sepia(91%) saturate(1232%) hue-rotate(331deg) brightness(96%) contrast(91%)'
};
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/courses");
      setCourses(res.data);
    } catch (err) {
      toast.error("Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCourse = async () => {
    if (!courseName.trim()) {
      toast.error("Course name is required");
      return;
    }
    if (customSubjects.some(s => s.trim() === "")) {
      toast.error("Please fill all 3 custom subjects");
      return;
    }

    const payload = {
      name: courseName,
      subjects: customSubjects.filter(s => s.trim() !== "")
    };

    setIsLoading(true);
    try {
      await axios.post("http://localhost:8080/api/courses", payload);
      toast.success("Course added successfully!");
      resetForm();
      fetchCourses();
    } catch (err) {
      toast.error("Error creating course");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCourseName("");
    setCustomSubjects(["", "", ""]);
    setShowForm(false);
  };

  const handleSubjectChange = (index, value) => {
    const updated = [...customSubjects];
    updated[index] = value;
    setCustomSubjects(updated);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
<h2 className="text-2xl font-semibold text-orange-500 flex items-center">
  {/* Training/Courses Icon */}
  <div className="mr-2" style={orangeFilter}>
    <img 
      src="/training.png" 
      alt="Courses" 
      className="h-6 w-6"  // Adjust size as needed
    />
  </div>
  All Courses
</h2>       <button
  onClick={() => setShowForm(!showForm)}
  disabled={isLoading}
  className="bg-orange-500/90 text-white px-4 py-2 rounded-lg hover:bg-orange-600/90 transition-all backdrop-blur-sm border border-orange-400/30 hover:border-orange-500/40 shadow-sm hover:shadow-md flex items-center justify-center gap-1.5"
>
  {showForm ? (
    <>
      {/* Cancel (X) Icon */}
      <svg 
        className="h-5 w-5" 
        viewBox="0 0 20 20" 
        fill="currentColor"
        aria-hidden="true"
      >
        <path 
          fillRule="evenodd" 
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
          clipRule="evenodd" 
        />
      </svg>
      Cancel
    </>
  ) : (
    <>
      {/* Add (+) Icon */}
      <svg 
        className="h-5 w-5" 
        viewBox="0 0 20 20" 
        fill="currentColor"
        aria-hidden="true"
      >
        <path 
          fillRule="evenodd" 
          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" 
          clipRule="evenodd" 
        />
      </svg>
      Add Course
    </>
  )}
</button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
          <h3 className="text-lg font-bold text-orange-500 mb-4">Create New Course</h3>
          <input
            type="text"
            placeholder="Course Name"
            className="w-full mb-3 p-2 border rounded"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
          />
          <div className="mb-3">
            <p>Default Subjects: English, Tamil</p>
          </div>
          {[0, 1, 2].map((i) => (
            <input
              key={i}
              type="text"
              placeholder={`Subject ${i + 1}`}
              className="w-full mb-2 p-2 border rounded"
              value={customSubjects[i]}
              onChange={(e) => handleSubjectChange(i, e.target.value)}
            />
          ))}
          <div className="flex justify-end gap-3">
            <button onClick={resetForm} className="px-4 py-2 bg-gray-500 text-white rounded">
              Cancel
            </button>
            <button onClick={handleAddCourse} className="px-4 py-2 bg-orange-500 text-white rounded">
              Save Course
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-center">Loading courses...</p>
      ) : courses.length === 0 ? (
        <p className="text-center text-gray-500">No courses found</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg cursor-pointer transition"
              onClick={() => navigate(`/courses/${course.id}`)}
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{course.name}</h3>
             <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
  {(() => {
    const subjects = course.subjects || [];
    const getName = (s) => typeof s === "string" ? s : s?.name;
    const fourth = getName(subjects[3]);
    const fifth = getName(subjects[4]);

    if (!fourth && !fifth) return "Less than 4 subjects";

    const names = [fourth, fifth].filter(Boolean);
    return names.join(", ") + ", ...";
  })()}
</p>





            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CoursePage;
