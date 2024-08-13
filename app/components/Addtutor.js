"use client";

import { useState, useEffect } from "react";

const AddTutor = () => {
    const [name, setName] = useState("");
    const [subject, setSubject] = useState("");
    const [hoursWorked, setHoursWorked] = useState(0);
    const [hoursScheduled, setHoursScheduled] = useState(0);
    const [studentIds, setStudentIds] = useState([]);
    const [scheduledClassIds, setScheduledClassIds] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [courses, setCourses] = useState([]);
    const [tutors, setTutors] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Fetch available courses and tutors from the API
    useEffect(() => {
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

        const fetchTutors = async () => {
            try {
                const response = await fetch("/api/tutor");
                if (!response.ok) {
                    throw new Error("Failed to fetch tutors");
                }
                const data = await response.json();
                setTutors(data);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchCourses();
        fetchTutors();
    }, []);

    const handleCourseChange = (courseId) => {
        setSelectedCourses((prevSelectedCourses) => {
            if (prevSelectedCourses.includes(courseId)) {
                return prevSelectedCourses.filter(id => id !== courseId);
            } else {
                return [...prevSelectedCourses, courseId];
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch("/api/tutor", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    subject,
                    hoursWorked,
                    hoursScheduled,
                    studentIds,
                    scheduledClassIds,
                    courseIds: selectedCourses, // Passing selected courses
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create tutor");
            }

            const data = await response.json();
            setSuccess("Tutor created successfully!");
            setName("");
            setSubject("");
            setHoursWorked(0);
            setHoursScheduled(0);
            setSelectedCourses([]); // Reset the selected courses
            setStudentIds([]);
            setScheduledClassIds([]);
            setTutors((prevTutors) => [...prevTutors, data]); // Update the tutor list
        } catch (error) {
            console.error("Error creating tutor:", error.message);
            setError(error.message);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-8 border border-gray-200 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Add New Tutor</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {success && <p className="text-green-500 mb-4">{success}</p>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Hours Worked</label>
                    <input
                        type="number"
                        value={hoursWorked}
                        onChange={(e) => setHoursWorked(parseInt(e.target.value))}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Hours Scheduled</label>
                    <input
                        type="number"
                        value={hoursScheduled}
                        onChange={(e) => setHoursScheduled(parseInt(e.target.value))}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Courses</label>
                    <div className="grid grid-cols-2 gap-2">
                        {courses.map((course) => (
                            <label key={course.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    value={course.id}
                                    checked={selectedCourses.includes(course.id)}
                                    onChange={() => handleCourseChange(course.id)}
                                    className="mr-2"
                                />
                                {course.courseName}
                            </label>
                        ))}
                    </div>
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Add Tutor
                </button>
            </form>

            <h3 className="text-xl font-semibold mt-8 mb-4">Tutors List</h3>
            {tutors.length === 0 ? (
                <p className="text-gray-700">No tutors available.</p>
            ) : (
                <ul className="space-y-4">
                    {tutors.map((tutor) => (
                        <li key={tutor.id} className="border p-4 rounded-lg shadow-sm">
                            <p className="text-lg font-semibold">{tutor.name}</p>
                            <p className="text-sm text-gray-600">Specialty: {tutor.subject}</p>
                            <p className="text-sm text-gray-600">Hours Worked: {tutor.hoursWorked}</p>
                            <p className="text-sm text-gray-600">Hours Scheduled: {tutor.hoursScheduled}</p>
                            <p className="text-sm text-gray-600">
                                Courses:{" "}
                                {tutor.courses && tutor.courses.length > 0 ? (
                                    tutor.courses.map((tc) => (
                                        <span key={tc.id} className="text-gray-800">{tc.course.courseName}</span>
                                    ))
                                ) : (
                                    <span className="text-gray-500">No courses assigned</span>
                                )}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AddTutor;
