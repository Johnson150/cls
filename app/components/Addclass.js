"use client";
import { useState, useEffect } from "react";
import Modal from "./Modal";
import CourseSelection from "./CourseSelection";
import TutorSelection from "./TutorSelection";
import StudentSelection from "./StudentSelection";
import TimeSelection from "./TimeSelection";
import ModeSelection from "./ModeSelection";

const MAX_CAPACITY = 4;

const AddClass = ({
  showModal,
  setShowModal,
  refreshClasses,
  startTime,
  endTime,
}) => {
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedTutors, setSelectedTutors] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [classDatestart, setClassDatestart] = useState(startTime || "");
  const [classDateend, setClassDateend] = useState(endTime || "");
  const [classMode, setClassMode] = useState("IN_PERSON");

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    fetchCourses();
    fetchTutors();
    fetchStudents();
  }, []);

  useEffect(() => {
    setSelectedTutors([]);
    setSelectedStudents([]);
    setStudentCount(0);
    setError(null);
  }, [selectedCourses]);

  useEffect(() => {
    if (startTime) {
      setClassDatestart(startTime);
    }
    if (endTime) {
      setClassDateend(endTime);
    }
  }, [startTime, endTime]);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses");
      if (!response.ok) throw new Error("Failed to fetch courses");
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchTutors = async () => {
    try {
      const response = await fetch("/api/tutor");
      if (!response.ok) throw new Error("Failed to fetch tutors");
      const data = await response.json();
      setTutors(data.length > 0 ? data : []);
    } catch (error) {
      setError("Failed to fetch tutors");
      setTutors([]);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/student");
      if (!response.ok) throw new Error("Failed to fetch students");
      const data = await response.json();
      setStudents(data.length > 0 ? data : []);
    } catch (error) {
      setError("Failed to fetch students");
      setStudents([]);
    }
  };

  const handleCourseChange = (courseId) => {
    setSelectedCourses((prev) => {
      if (prev.includes(courseId)) {
        return prev.filter((id) => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const handleTutorChange = (tutorId) => {
    setSelectedTutors((prev) => {
      if (prev.includes(tutorId)) {
        return prev.filter((id) => id !== tutorId);
      } else {
        return [...prev, tutorId];
      }
    });
  };

  const handleStudentChange = (studentId) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        const updatedStudents = prev.filter((id) => id !== studentId);
        setStudentCount(updatedStudents.length);
        return updatedStudents;
      } else {
        const updatedStudents = [...prev, studentId];
        setStudentCount(updatedStudents.length);
        return updatedStudents;
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/scheduledclass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classDatestart,
          classDateend,
          status: "NOT_BOOKED_OFF",
          tutorIds: selectedTutors,
          studentIds: selectedStudents,
          courseIds: selectedCourses,
          classMode,
          bookedOffAt: null,
          currentEnrollment: selectedStudents.length,
        }),
      });

      if (!response.ok) throw new Error("Failed to schedule class");

      const newClass = await response.json();
      setSuccess("Class scheduled successfully!");

      setSelectedCourses([]);
      setSelectedTutors([]);
      setSelectedStudents([]);
      setStudentCount(0);
      setClassDatestart("");
      setClassDateend("");
      setClassMode("IN_PERSON");

      if (refreshClasses) refreshClasses();

      setTimeout(() => setShowModal(false), 2000);
    } catch (error) {
      setError(error.message);
    }
  };

  const tutorsForCourses = tutors.filter((tutor) =>
    selectedCourses.some((courseId) =>
      tutor.courses.some((tc) => tc.course.id === courseId),
    ),
  );
  const nonCourseTutors = tutors.filter(
    (tutor) =>
      !selectedCourses.some((courseId) =>
        tutor.courses.some((tc) => tc.course.id === courseId),
      ),
  );

  const studentsForCourses = students.filter((student) =>
    selectedCourses.some((courseId) =>
      student.courses.some((sc) => sc.course.id === courseId),
    ),
  );
  const nonCourseStudents = students.filter(
    (student) =>
      !selectedCourses.some((courseId) =>
        student.courses.some((sc) => sc.course.id === courseId),
      ),
  );

  return (
    <Modal
      showModal={showModal}
      setShowModal={setShowModal}
      title="Schedule New Class"
    >
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-3xl mx-auto">
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        {success && (
          <p className="text-green-500 mb-4 text-center">{success}</p>
        )}
        <form onSubmit={handleSubmit}>
          <CourseSelection
            courses={courses}
            selectedCourses={selectedCourses}
            handleCourseChange={handleCourseChange}
          />
          <TutorSelection
            tutorsForCourses={tutorsForCourses}
            selectedTutors={selectedTutors}
            handleTutorChange={handleTutorChange}
            nonCourseTutors={nonCourseTutors}
          />
          <StudentSelection
            studentsForCourses={studentsForCourses}
            selectedStudents={selectedStudents}
            handleStudentChange={handleStudentChange}
            nonCourseStudents={nonCourseStudents}
          />
          <TimeSelection
            classDatestart={classDatestart}
            setClassDatestart={setClassDatestart}
            classDateend={classDateend}
            setClassDateend={setClassDateend}
          />
          <ModeSelection classMode={classMode} setClassMode={setClassMode} />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Schedule Class
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default AddClass;
