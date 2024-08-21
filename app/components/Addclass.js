"use client";

import { useState, useEffect } from "react";
import Modal from './Modal'; // Assuming Modal is in the same directory
import moment from "moment";

const AddClass = ({ showModal, setShowModal, refreshClasses, startTime }) => {
    const [selectedCourse, setSelectedCourse] = useState("");
    const [courses, setCourses] = useState([]);
    const [tutors, setTutors] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedTutors, setSelectedTutors] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [classDatestart, setClassDatestart] = useState(startTime);
    const [classDateend, setClassDateend] = useState("");

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        if (startTime) {
            const startDate = moment(startTime);
            const endDate = moment(startDate).add(3, 'hours');

            setClassDatestart(startDate.format('YYYY-MM-DDTHH:mm'));
            setClassDateend(endDate.format('YYYY-MM-DDTHH:mm'));
        } else {
            // Reset to empty if no startTime is provided
            setClassDatestart("");
            setClassDateend("");
        }
    }, [startTime]);


    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            // Reset the form fields
            setSelectedTutors([]);
            setSelectedStudents([]);
            setTutors([]); // Clear previous tutors
            setStudents([]); // Clear previous students
            setError(null); // Clear previous errors

            if (startTime) {
                const startDate = moment(startTime);
                const endDate = moment(startDate).add(3, 'hours');
                setClassDatestart(startDate.format('YYYY-MM-DDTHH:mm'));
                setClassDateend(endDate.format('YYYY-MM-DDTHH:mm'));
            } else {
                setClassDatestart("");
                setClassDateend("");
            }

            // Fetch tutors and students for the selected course
            fetchTutors(selectedCourse);
            fetchStudents(selectedCourse);
        } else {
            setTutors([]);
            setStudents([]);
            setClassDatestart("");
            setClassDateend("");
        }
    }, [selectedCourse, startTime]);


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
            setTutors(data.length > 0 ? data : []); // Set tutors or empty array
        } catch (error) {
            setError("Failed to fetch tutors");
            setTutors([]); // Ensure tutors are cleared
        }
    };

    const fetchStudents = async (courseId) => {
        try {
            const response = await fetch(`/api/student?courseIds=${courseId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch students");
            }
            const data = await response.json();
            setStudents(data.length > 0 ? data : []); // Set students or empty array
        } catch (error) {
            setError("Failed to fetch students");
            setStudents([]); // Ensure students are cleared
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
                return prev.filter(id => id !== studentId);
            } else {
                return [...prev, studentId];
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const startDate = moment(classDatestart);
            const endDate = moment(classDateend);
            const durationInHours = endDate.diff(startDate, 'hours', true);
            const now = moment().toISOString();

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
                    bookedOffAt: null,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to schedule class");
            }

            const newClass = await response.json();

            // Preserve and update course associations for tutors
            for (let tutorId of selectedTutors) {
                const tutorResponse = await fetch(`/api/tutor/${tutorId}`);
                const tutorData = await tutorResponse.json();
                const updatedCourses = [...new Set([...tutorData.courses.map(c => c.courseId), selectedCourse])];

                await fetch(`/api/tutor/${tutorId}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        hoursScheduled: durationInHours,
                        hoursScheduledAt: now,
                        courseIds: updatedCourses,
                    }),
                });
            }

            // Preserve and update course associations for students
            for (let studentId of selectedStudents) {
                const studentResponse = await fetch(`/api/student/${studentId}`);
                const studentData = await studentResponse.json();
                const updatedCourses = [...new Set([...studentData.courses.map(c => c.courseId), selectedCourse])];

                await fetch(`/api/student/${studentId}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        hoursScheduled: durationInHours,
                        hoursScheduledAt: now,
                        courseIds: updatedCourses,
                    }),
                });
            }

            setSuccess("Class scheduled successfully!");
            setSelectedCourse("");
            setSelectedTutors([]);
            setSelectedStudents([]);
            setClassDatestart("");
            setClassDateend("");

            if (refreshClasses) refreshClasses();
            setTimeout(() => setShowModal(false), 2000);
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
