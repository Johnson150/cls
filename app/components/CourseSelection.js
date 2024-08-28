import { useState } from "react";

const CourseSelection = ({ courses, selectedCourses, handleCourseChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Courses
        </label>
        <button
          type="button"
          onClick={toggleCollapse}
          className="text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out"
        >
          {isCollapsed ? "Show" : "Hide"}
        </button>
      </div>
      {!isCollapsed && (
        <div className="grid grid-cols-3 gap-4 mt-2">
          {courses.map((course) => (
            <label key={course.id} className="flex items-center space-x-3">
              <input
                type="checkbox"
                value={course.id}
                checked={selectedCourses.includes(course.id)}
                onChange={() => handleCourseChange(course.id)}
                className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
              />
              <span className="text-gray-700">{course.courseName}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseSelection;
