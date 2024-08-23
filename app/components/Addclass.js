"use client";

import { useState, useEffect } from "react";
import Modal from './Modal'; // Assuming Modal is in the same directory
import moment from "moment";

const MAX_CAPACITY = 4; // Set maximum capacity to 4

const AddClass = ({ showModal, setShowModal, refreshClasses, startTime }) => {
    const [selectedCourse, setSelectedCourse] = useState("");
    const [courses, setCourses] = useState([]);
    const [tutors, setTutors] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedTutors, setSelectedTutors] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [classDatestart, setClassDatestart] = useState(startTime);
    const [classDateend, setClassDateend] = useState("");
    const [classMode, setClassMode] = useState("IN_PERSON"); // Default to in-person

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [studentCount, setStudentCount] = useState(0); // Track student count locally

    useEffect(() => {
        if (startTime) {
            const startDate = moment(startTime);
            const endDate = moment(startDate).add(3, 'hours');

            setClassDatestart(startDate.format('YYYY-MM-DDTHH:mm'));
            setClassDateend(endDate.format('YYYY-MM-DDTHH:mm'));
        } else {
            setClassDatestart("");
            setClassDateend("");
        }
    }, [startTime]);

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            setSelectedTutors([]);
            setSelectedStudents([]);
            setStudentCount(0); // Reset count when a new course is selected
            setTutors([]);
            setStudents([]);
            setError(null);

            fetchTutors(selectedCourse);
            fetchStudents(selectedCourse);
        } else {
            setTutors([]);
            setStudents([]);
            setClassDatestart("");
            setClassDateend("");
        }
    }, [selectedCourse]);

    const fetchCourses = async () => {
        try {
            const response = await fetch("/api/courses");
            if (!response.ok) {
                throw new Error("Failed to fetch courses");
            }
            const data = await response.json();
            setCourses(data);
        } catch (error) {
            setError(error.message);
        }
    };

    const fetchTutors = async (courseId) => {
        try {
            const response = await fetch(`/api/tutor?courseIds=${courseId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch tutors");
            }
            const data = await response.json();
            setTutors(data.length > 0 ? data : []);
        } catch (error) {
            setError("Failed to fetch tutors");
            setTutors([]);
        }
    };

    const fetchStudents = async (courseId) => {
        try {
            const response = await fetch(`/api/student?courseIds=${courseId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch students");
            }
            const data = await response.json();
            setStudents(data.length > 0 ? data : []);
        } catch (error) {
            setError("Failed to fetch students");
            setStudents([]);
        }
    };

    const handleTutorChange = (tutorId) => {
        setSelectedTutors((prev) => {
            if (prev.includes(tutorId)) {
                return prev.filter(id => id !== tutorId);
            } else {
                return [...prev, tutorId];
            }
        });
    };

    const handleStudentChange = (studentId) => {
        setSelectedStudents((prev) => {
            if (prev.includes(studentId)) {
                const updatedStudents = prev.filter(id => id !== studentId);
                setStudentCount(updatedStudents.length); // Update count when a student is removed
                return updatedStudents;
            } else {
                const updatedStudents = [...prev, studentId];
                setStudentCount(updatedStudents.length); // Update count when a student is added
                if (updatedStudents.length > MAX_CAPACITY) {
                    setError(`You have exceeded the recommended capacity of ${MAX_CAPACITY} students.`);
                } else {
                    setError(null); // Clear the error if within capacity
                }
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
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    classDatestart,
                    classDateend,
                    status: 'NOT_BOOKED_OFF',
                    tutorIds: selectedTutors,
                    studentIds: selectedStudents,
                    courseId: selectedCourse, // Ensure courseId is included here
                    classMode, // Include the classMode field
                    bookedOffAt: null,
                    currentEnrollment: selectedStudents.length,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to schedule class");
            }

            const newClass = await response.json();

            // Success handling
            setSuccess("Class scheduled successfully!");

            // Clear selections and reset the form
            setSelectedCourse("");
            setSelectedTutors([]);
            setSelectedStudents([]);
            setStudentCount(0);
            setClassDatestart("");
            setClassDateend("");
            setClassMode("IN_PERSON"); // Reset to default

            // Refresh classes list (assuming refreshClasses is passed as a prop)
            if (refreshClasses) {
                refreshClasses();
            }

            // Close the modal after a short delay
            setTimeout(() => {
                setShowModal(false);
            }, 2000);
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <Modal showModal={showModal} setShowModal={setShowModal}>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-6">Schedule New Class</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {success && <p className="text-green-500 mb-4">{success}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Course</label>
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="">Select a course</option>
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.courseName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Student Capacity: {studentCount}/{MAX_CAPACITY}
                        </label>
                    </div>

                    {tutors.length > 0 ? (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Tutors</label>
                            <div className="grid grid-cols-2 gap-2">
                                {tutors.map((tutor) => (
                                    <label key={tutor.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            value={tutor.id}
                                            checked={selectedTutors.includes(tutor.id)}
                                            onChange={() => handleTutorChange(tutor.id)}
                                            className="mr-2"
                                        />
                                        {tutor.name}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500">No tutors available</p>
                    )}

                    {students.length > 0 ? (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Students</label>
                            <div className="grid grid-cols-2 gap-2">
                                {students.map((student) => (
                                    <label key={student.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            value={student.id}
                                            checked={selectedStudents.includes(student.id)}
                                            onChange={() => handleStudentChange(student.id)}
                                            className="mr-2"
                                        />
                                        {student.name}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500">No students available</p>
                    )}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Class Mode</label>
                        <select
                            value={classMode}
                            onChange={(e) => setClassMode(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="IN_PERSON">In Person</option>
                            <option value="ONLINE">Online</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Class Start Date</label>
                        <input
                            type="datetime-local"
                            value={classDatestart}
                            onChange={(e) => setClassDatestart(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Class End Date</label>
                        <input
                            type="datetime-local"
                            value={classDateend}
                            onChange={(e) => setClassDateend(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
                    >
                        Schedule Class
                    </button>
                </form>
            </div>
        </Modal>
    );
};

export default AddClass;
