// pages/CourseDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

function CourseDetails() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:8080/api/courses/${id}`)
      .then((res) => {
        setCourse(res.data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return <div className="p-6">Loading course details...</div>;
  }

  if (!course) {
    return <div className="p-6 text-red-500">Course not found</div>;
  }

  return (
    <div className="p-6">
<Link 
  to="/courses" 
  className="text-orange-500 hover:underline flex items-center font-semibold"
>
  {/* Larger, bolder arrow */}
  <svg 
    className="h-5 w-5 mr-1" 
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
  Back to Courses
</Link>      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mt-4">{course.name}</h2>

      <div className="mt-4">
        <h3 className="text-xl font-semibold text-orange-600 mb-2">Subjects</h3>
        {course.subjects && course.subjects.length > 0 ? (
          <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300">
            {course.subjects.map((subject, index) => (
              <li key={index}>{subject.name}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No subjects listed for this course.</p>
        )}
      </div>
    </div>
  );
}

export default CourseDetails;
