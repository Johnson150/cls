import { useState } from "react";

const TutorSelection = ({
  tutorsForCourses,
  selectedTutors,
  handleTutorChange,
  nonCourseTutors,
}) => {
  const [showInCourseTutors, setShowInCourseTutors] = useState(false);
  const [showNonCourseTutors, setShowNonCourseTutors] = useState(false);

  return (
    <>
      {tutorsForCourses.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">
              Tutors (In selected courses)
            </label>
            <button
              type="button"
              onClick={() => setShowInCourseTutors(!showInCourseTutors)}
              className="text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out"
            >
              {showInCourseTutors ? "Hide" : "Show"}
            </button>
          </div>
          {showInCourseTutors && (
            <div className="grid grid-cols-3 gap-4 mt-2">
              {tutorsForCourses.map((tutor) => (
                <label
                  key={tutor.id}
                  className={`flex items-center cursor-pointer space-x-3 ${
                    selectedTutors.includes(tutor.id)
                      ? "bg-blue-50"
                      : "bg-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    value={tutor.id}
                    checked={selectedTutors.includes(tutor.id)}
                    onChange={() => handleTutorChange(tutor.id)}
                    className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
                  />
                  <span className="text-gray-700">{tutor.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {nonCourseTutors.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">
              Tutors (Not in selected courses)
            </label>
            <button
              type="button"
              onClick={() => setShowNonCourseTutors(!showNonCourseTutors)}
              className="text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out"
            >
              {showNonCourseTutors ? "Hide" : "Show"}
            </button>
          </div>
          {showNonCourseTutors && (
            <div className="grid grid-cols-3 gap-4 mt-2">
              {nonCourseTutors.map((tutor) => (
                <label
                  key={tutor.id}
                  className={`flex items-center cursor-pointer space-x-3 ${
                    selectedTutors.includes(tutor.id)
                      ? "bg-blue-50"
                      : "bg-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    value={tutor.id}
                    checked={selectedTutors.includes(tutor.id)}
                    onChange={() => handleTutorChange(tutor.id)}
                    className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
                  />
                  <span className="text-gray-700">{tutor.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default TutorSelection;
