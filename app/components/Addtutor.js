"use client";

import { useState, useEffect } from "react";
import Modal from './Modal'; // Assuming Modal is in the same directory

const AddTutor = ({ refreshTutors }) => {
    const [name, setName] = useState("");
    const [hoursWorked, setHoursWorked] = useState(0);
    const [hoursScheduled, setHoursScheduled] = useState(0);
    const [timesBookedOff, setTimesBookedOff] = useState(0);
    const [contact, setContact] = useState(""); // New contact field
    const [studentIds, setStudentIds] = useState([]);
    const [scheduledClassIds, setScheduledClassIds] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [courses, setCourses] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showModal, setShowModal] = useState(false); // State to control modal visibility

    // Fetch available courses from the API
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

        fetchCourses();
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
                    hoursWorked,
                    hoursScheduled,
                    timesBookedOff,
                    contact, // Include contact in the request body
                    studentIds,
                    scheduledClassIds,
                    courseIds: selectedCourses, // Passing selected courses
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create tutor");
            }

            const data = await response.json();
            setSuccess("Tutor added successfully!"); // Set success message
            setName("");
            setHoursWorked(0);
            setHoursScheduled(0);
            setTimesBookedOff(0);
            setContact(""); // Reset contact field
            setSelectedCourses([]); // Reset the selected courses
            setStudentIds([]);
            setScheduledClassIds([]);
            if (refreshTutors) {
                refreshTutors(); // Refresh the tutor list if the function is provided
            }
            setTimeout(() => {
                setShowModal(false); // Close the modal after a short delay
            }, 2000); // Close modal after 2 seconds
        } catch (error) {
            console.error("Error creating tutor:", error.message);
            setError(error.message);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <button
                onClick={() => setShowModal(true)}
                className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
            >
                Add New Tutor
            </button>

            <Modal showModal={showModal} setShowModal={setShowModal}>
                <div className="bg-white p-6 rounded-lg shadow-lg"> {/* Set a white background for the modal content */}
                    <h2 className="text-2xl font-semibold mb-6">Add New Tutor</h2>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    {success && <p className="text-green-500 mb-4">{success}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Hours Worked</label>
                            <input
                                type="number"
                                value={hoursWorked}
                                onChange={(e) => setHoursWorked(parseInt(e.target.value))}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Hours Scheduled</label>
                            <input
                                type="number"
                                value={hoursScheduled}
                                onChange={(e) => setHoursScheduled(parseInt(e.target.value))}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Times Booked Off</label>
                            <input
                                type="number"
                                value={timesBookedOff}
                                onChange={(e) => setTimesBookedOff(parseInt(e.target.value))}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Contact</label>
                            <input
                                type="text"
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
                        >
                            Add Tutor
                        </button>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default AddTutor;
