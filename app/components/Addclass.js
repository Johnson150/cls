"use client";

import { useState, useEffect } from "react";
import Modal from './Modal'; // Assuming Modal is in the same directory

const AddClass = ({ showModal, setShowModal, refreshClasses }) => {
    const [selectedCourse, setSelectedCourse] = useState("");
    const [courses, setCourses] = useState([]);
    const [tutors, setTutors] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedTutors, setSelectedTutors] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [classDate, setClassDate] = useState("");
    const [duration, setDuration] = useState(60); // Default duration in minutes
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Fetch available courses from the API
    useEffect(() => {
        fetchCourses();
    }, []);

    // Fetch tutors and students based on the selected course
    useEffect(() => {
        if (selectedCourse) {
            fetchTutors(selectedCourse);
            fetchStudents(selectedCourse);
        }
    }, [selectedCourse]);

    // Separate function to fetch courses
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

    // Separate function to fetch tutors based on selected course
    useEffect(() => {
        if (selectedCourse) {
            fetchTutors(selectedCourse);
        }
    }, [selectedCourse]);

    const fetchTutors = async (courseId) => {
        try {
            const response = await fetch(`/api/tutor?courseIds=${courseId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch tutors");
            }
            const data = await response.json();
            setTutors(data);
        } catch (error) {
            setError(error.message);
        }
    };
    // Separate function to fetch students based on selected course
    const fetchStudents = async (courseId) => {
        try {
            const response = await fetch(`/api/student?courseId=${courseId}&fields=minimal`);
            if (!response.ok) {
                throw new Error("Failed to fetch students");
            }
            const data = await response.json();
            setStudents(data);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleTutorChange = (tutorId) => {
        setSelectedTutors((prevSelectedTutors) => {
            if (prevSelectedTutors.includes(tutorId)) {
                return prevSelectedTutors.filter(id => id !== tutorId);
            } else {
                return [...prevSelectedTutors, tutorId];
            }
        });
    };

    const handleStudentChange = (studentId) => {
        setSelectedStudents((prevSelectedStudents) => {
            if (prevSelectedStudents.includes(studentId)) {
                return prevSelectedStudents.filter(id => id !== studentId);
            } else {
                return [...prevSelectedStudents, studentId];
            }
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        console.log("Submitting with data:", {
            classDate,
            duration,
            tutorIds: selectedTutors,
            studentIds: selectedStudents,
        });

        try {
            const response = await fetch("/api/scheduledclass", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    classDate,
                    duration,
                    status: 'NOT_BOOKED_OFF',
                    tutorIds: selectedTutors,
                    studentIds: selectedStudents,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to schedule class");
            }

            setSuccess("Class scheduled successfully!");
            // Reset form
            setSelectedCourse("");
            setSelectedTutors([]);
            setSelectedStudents([]);
            setClassDate("");
            setDuration(60);

            // Refresh classes or close modal, etc.
            if (refreshClasses) refreshClasses();
            setTimeout(() => setShowModal(false), 2000);
        } catch (error) {
            console.error("Error scheduling class:", error.message);
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

                    {selectedCourse && (
                        <>
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
                                            {student.name} {/* Display only the student's name */}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Class Date</label>
                        <input
                            type="datetime-local"
                            value={classDate}
                            onChange={(e) => setClassDate(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                        <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(parseInt(e.target.value))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
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
