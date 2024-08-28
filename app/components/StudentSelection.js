import { useState } from "react";

const StudentSelection = ({
  studentsForCourses,
  selectedStudents,
  handleStudentChange,
  nonCourseStudents,
}) => {
  const [showInCourseStudents, setShowInCourseStudents] = useState(false);
  const [showNonCourseStudents, setShowNonCourseStudents] = useState(false);

  return (
    <>
      {studentsForCourses.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">
              Students (In selected courses)
            </label>
            <button
              type="button"
              onClick={() => setShowInCourseStudents(!showInCourseStudents)}
              className="text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out"
            >
              {showInCourseStudents ? "Hide" : "Show"}
            </button>
          </div>
          {showInCourseStudents && (
            <div className="grid grid-cols-3 gap-4 mt-2">
              {studentsForCourses.map((student) => (
                <label
                  key={student.id}
                  className={`flex items-center cursor-pointer space-x-3 ${
                    selectedStudents.includes(student.id)
                      ? "bg-blue-50"
                      : "bg-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    value={student.id}
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => handleStudentChange(student.id)}
                    className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
                  />
                  <span className="text-gray-700">{student.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {nonCourseStudents.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">
              Students (Not in selected courses)
            </label>
            <button
              type="button"
              onClick={() => setShowNonCourseStudents(!showNonCourseStudents)}
              className="text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out"
            >
              {showNonCourseStudents ? "Hide" : "Show"}
            </button>
          </div>
          {showNonCourseStudents && (
            <div className="grid grid-cols-3 gap-4 mt-2">
              {nonCourseStudents.map((student) => (
                <label
                  key={student.id}
                  className={`flex items-center cursor-pointer space-x-3 ${
                    selectedStudents.includes(student.id)
                      ? "bg-blue-50"
                      : "bg-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    value={student.id}
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => handleStudentChange(student.id)}
                    className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
                  />
                  <span className="text-gray-700">{student.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default StudentSelection;
