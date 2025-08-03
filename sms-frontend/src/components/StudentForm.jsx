import React, { useState, useEffect } from "react";
import axios from "axios";

const StudentForm = ({ selectedStudent, onSuccess, onCancel }) => {
  const [student, setStudent] = useState({
    name: "",
    email: "",
    courseId: "",
  });

  const [courses, setCourses] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/courses")
      .then((res) => setCourses(res.data))
      .catch((err) => console.error("Error loading courses:", err));

    if (selectedStudent) {
      setStudent({
        name: selectedStudent.name,
        email: selectedStudent.email,
        courseId: selectedStudent.course?.id || "",
      });
    }
  }, [selectedStudent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: student.name,
      email: student.email,
      course: { id: student.courseId },
    };

    try {
      if (selectedStudent) {
        await axios.put(
          `http://localhost:8080/api/students/${selectedStudent.id}`,
          payload
        );
      } else {
        await axios.post("http://localhost:8080/api/students", payload);
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving student:", error);
    }
  };

  const inputStyle = "block mb-3 p-3 w-full rounded-lg backdrop-blur-sm bg-white/80 dark:bg-gray-700/80 border border-white/30 dark:border-gray-600/50 text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all shadow-sm";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-xl shadow-2xl backdrop-blur-md border border-white/30 dark:border-gray-700/50"
    >
      <h3 className="text-xl mb-4 text-orange-500 font-semibold">
        {selectedStudent ? "Edit Student" : "Add Student"}
      </h3>

      <input
        name="name"
        placeholder="Name"
        value={student.name}
        onChange={handleChange}
        required
        className={inputStyle}
      />

      <input
        name="email"
        placeholder="Email"
        value={student.email}
        onChange={handleChange}
        required
        className={inputStyle}
      />

      {!selectedStudent ? (
        <select
          name="courseId"
          value={student.courseId}
          onChange={handleChange}
          required
          className={`${inputStyle} appearance-none bg-white/80 dark:bg-gray-700/80`}
        >
          <option value="">-- Select Course --</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id} className="bg-white dark:bg-gray-800">
              {course.name}
            </option>
          ))}
        </select>
      ) : (
        <input
          value={selectedStudent.course?.name || "N/A"}
          readOnly
          className="block mb-3 p-3 w-full rounded-lg bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm border border-white/30 dark:border-gray-600/50 text-gray-800 dark:text-gray-300 cursor-not-allowed"
        />
      )}

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500/90 text-white px-5 py-2 rounded-lg hover:bg-gray-600/90 transition-all backdrop-blur-sm border border-gray-400/30 hover:border-gray-500/40 shadow-sm hover:shadow-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-orange-500/90 text-white px-5 py-2 rounded-lg hover:bg-orange-600/90 transition-all backdrop-blur-sm border border-orange-400/30 hover:border-orange-500/40 shadow-sm hover:shadow-md"
        >
          {selectedStudent ? "Update" : "Add"}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;