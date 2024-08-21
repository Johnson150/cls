"use client";
import { useState, useEffect } from "react";
import AddTutor from '@/app/components/Addtutor';
import Modal from '@/app/components/Modal';

const TutorList = () => {
    const [tutors, setTutors] = useState([]);
    const [error, setError] = useState(null);
    const [courses, setCourses] = useState([]);
    const [editingTutor, setEditingTutor] = useState(null);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchTutors = async () => {
        try {
            const response = await fetch("/api/tutor", { cache: "no-cache" });
            if (!response.ok) {
                throw new Error("Failed to fetch tutors");
            }
            const data = await response.json();
            setTutors(data);
        } catch (error) {
            setError(error.message);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await fetch("/api/courses");
            console.log("Fetch courses response status:", response.status);

            if (!response.ok) {
                throw new Error("Failed to fetch courses");
            }

            const data = await response.json();
            console.log("Fetched courses data:", data);

            if (data.length === 0) {
                console.log("No courses found in the database.");
            }

            setCourses(data);
        } catch (error) {
            console.error("Error fetching courses:", error.message);
            setError(error.message);
        }
    };

    useEffect(() => {
        fetchTutors();
        fetchCourses();
    }, [refreshKey]);  // Re-fetch data when refreshKey changes

    const handleDelete = async (tutorId) => {
        try {
            const response = await fetch(`/api/tutor/${tutorId}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error("Failed to delete tutor");
            }
            setRefreshKey((prevKey) => prevKey + 1);  // Increment refreshKey to re-fetch data
        } catch (error) {
            setError(error.message);
        }
    };

    const handleEdit = (tutor) => {
        setEditingTutor(tutor);
        // Extract course IDs from the tutor's courses and set them in the state
        const tutorCourses = tutor.courses ? tutor.courses.map(tc => tc.course.id) : [];
        setSelectedCourses(tutorCourses);
        setShowEditModal(true);
    };

    const handleCourseChange = (courseId) => {
        setSelectedCourses(prevSelectedCourses => {
            if (prevSelectedCourses.includes(courseId)) {
                return prevSelectedCourses.filter(id => id !== courseId);
            } else {
                return [...prevSelectedCourses, courseId];
            }
        });
    };

    const handleUpdate = async (updatedTutor) => {
        try {
            const validSelectedCourses = selectedCourses.filter(courseId => courseId !== null && courseId !== undefined);

            const response = await fetch(`/api/tutor/${updatedTutor.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: updatedTutor.name,
                    hoursWorked: updatedTutor.hoursWorked,
                    hoursScheduled: updatedTutor.hoursScheduled,
                    timesBookedOff: updatedTutor.timesBookedOff,
                    contact: updatedTutor.contact,
                    studentIds: updatedTutor.students ? updatedTutor.students.map(s => s.id) : [],
                    scheduledClassIds: updatedTutor.scheduledClasses ? updatedTutor.scheduledClasses.map(sc => sc.id) : [],
                    courseIds: validSelectedCourses.length > 0 ? validSelectedCourses : null,
                }),
            });

            const updatedTutorData = await response.json();
            console.log('Updated Tutor Data:', updatedTutorData); // Log the response

            if (!response.ok) {
                throw new Error("Failed to update tutor");
            }

            setTutors(tutors.map(tutor => tutor.id === updatedTutor.id ? updatedTutorData : tutor));
            setShowEditModal(false);
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 border border-gray-200 rounded-lg shadow-md">
            <div className="flex justify-center mb-6">
                <AddTutor refreshTutors={() => setRefreshKey((prevKey) => prevKey + 1)} />
            </div>

            <h2 className="text-2xl font-semibold mb-4 text-center">Tutors List</h2>

            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
            {tutors.length === 0 ? (
                <p className="text-gray-700 text-center">No tutors available.</p>
            ) : (
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full">
                        <div className="overflow-y-auto max-h-96">
                            <table className="min-w-full bg-white border border-gray-200">
                                <thead className="bg-gray-100 sticky top-0 z-10">
                                    <tr>
                                        <th className="py-2 px-4 border-b">Name</th>
                                        <th className="py-2 px-4 border-b">Hours Worked</th>
                                        <th className="py-2 px-4 border-b">Hours Scheduled</th>
                                        <th className="py-2 px-4 border-b">Times Booked Off</th>
                                        <th className="py-2 px-4 border-b">Contact</th>
                                        <th className="py-2 px-4 border-b">Courses</th>
                                        <th className="py-2 px-4 border-b">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tutors.map((tutor) => (
                                        <tr key={tutor.id}>
                                            <td className="py-2 px-4 border-b">{tutor.name}</td>
                                            <td className="py-2 px-4 border-b">{tutor.hoursWorked}</td>
                                            <td className="py-2 px-4 border-b">{tutor.hoursScheduled}</td>
                                            <td className="py-2 px-4 border-b">{tutor.timesBookedOff}</td>
                                            <td className="py-2 px-4 border-b">{tutor.contact}</td>
                                            <td className="py-2 px-4 border-b">
                                                {tutor.courses && tutor.courses.length > 0 ? (
                                                    tutor.courses.map((tc, index) => (
                                                        <span key={tc.course.id} className="text-gray-800">
                                                            {tc.course ? tc.course.courseName : "Unknown Course"}
                                                            {index < tutor.courses.length - 1 && ", "}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-500">No courses assigned</span>
                                                )}
                                            </td>
                                            <td className="py-2 px-4 border-b">
                                                <button
                                                    onClick={() => handleEdit(tutor)}
                                                    className="text-blue-500 hover:text-blue-700 mr-2"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(tutor.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && (
                <Modal showModal={showEditModal} setShowModal={setShowEditModal}>
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold mb-6">Edit Tutor</h2>
                        {error && <p className="text-red-500 mb-4">{error}</p>}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleUpdate(editingTutor);
                            }}
                        >
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    value={editingTutor?.name || ''}
                                    onChange={(e) =>
                                        setEditingTutor({ ...editingTutor, name: e.target.value })
                                    }
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Hours Worked</label>
                                <input
                                    type="number"
                                    value={editingTutor?.hoursWorked || 0}
                                    onChange={(e) =>
                                        setEditingTutor({
                                            ...editingTutor,
                                            hoursWorked: parseInt(e.target.value),
                                        })
                                    }
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Hours Scheduled</label>
                                <input
                                    type="number"
                                    value={editingTutor?.hoursScheduled || 0}
                                    onChange={(e) =>
                                        setEditingTutor({
                                            ...editingTutor,
                                            hoursScheduled: parseInt(e.target.value),
                                        })
                                    }
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Times Booked Off</label>
                                <input
                                    type="number"
                                    value={editingTutor?.timesBookedOff || 0}
                                    onChange={(e) =>
                                        setEditingTutor({
                                            ...editingTutor,
                                            timesBookedOff: parseInt(e.target.value),
                                        })
                                    }
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Contact</label>
                                <input
                                    type="text"
                                    value={editingTutor?.contact || ''}
                                    onChange={(e) =>
                                        setEditingTutor({ ...editingTutor, contact: e.target.value })
                                    }
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
                                Update Tutor
                            </button>
                        </form>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default TutorList;
