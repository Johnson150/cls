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
    const [showArchived, setShowArchived] = useState(false); // New state for toggling archived view

    const fetchTutors = async () => {
        try {
            const response = await fetch(`/api/tutor?includeArchived=${showArchived}`, { cache: "no-cache" });
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
            if (!response.ok) {
                throw new Error("Failed to fetch courses");
            }
            const data = await response.json();
            setCourses(data);
        } catch (error) {
            setError(error.message);
        }
    };

    useEffect(() => {
        fetchTutors();
        fetchCourses();
    }, [refreshKey, showArchived]);

    const handleDelete = async (tutorId) => {
        try {
            const response = await fetch(`/api/tutor/${tutorId}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error("Failed to delete tutor");
            }
            setRefreshKey((prevKey) => prevKey + 1);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleArchiveToggle = async (tutorId, currentArchivedStatus) => {
        try {
            const response = await fetch(`/api/tutor/${tutorId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ archived: !currentArchivedStatus }),
            });
            if (!response.ok) {
                throw new Error("Failed to update tutor");
            }
            // Refresh the tutors list to reflect changes
            setRefreshKey((prevKey) => prevKey + 1);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleEdit = (tutor) => {
        setEditingTutor(tutor);
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
                    contact: updatedTutor.contact,
                    studentIds: updatedTutor.students ? updatedTutor.students.map(s => s.id) : [],
                    scheduledClassIds: updatedTutor.scheduledClasses ? updatedTutor.scheduledClasses.map(sc => sc.id) : [],
                    courseIds: validSelectedCourses,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update tutor");
            }

            const updatedTutorData = await response.json();
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

            <h2 className="text-2xl font-semibold mb-4 text-center">
                {showArchived ? "Archive Tutors List" : "Active Tutors List"}
            </h2>

            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setShowArchived(!showArchived)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
                >
                    {showArchived ? "Show Active Tutors" : "Show Archived Tutors"}
                </button>
            </div>
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
                                        <th className="py-2 px-4 border-b">Contact</th>
                                        <th className="py-2 px-4 border-b">Courses</th>
                                        <th className="py-2 px-4 border-b">Status</th>
                                        <th className="py-2 px-4 border-b">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tutors.map((tutor) => (
                                        <tr key={tutor.id}>
                                            <td className="py-2 px-4 border-b">{tutor.name}</td>
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
                                                {tutor.archived ? (
                                                    <span className="text-red-500">Archived</span>
                                                ) : (
                                                    <span className="text-green-500">Active</span>
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
                                                    className="text-red-500 hover:text-red-700 mr-2"
                                                >
                                                    Delete
                                                </button>
                                                <button
                                                    onClick={() => handleArchiveToggle(tutor.id, tutor.archived)}
                                                    className={`hover:text-yellow-700 ${tutor.archived ? "text-yellow-500" : "text-yellow-500"}`}
                                                >
                                                    {tutor.archived ? "Unarchive" : "Archive"}
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
                                    value={editingTutor?.name || ""}
                                    onChange={(e) => setEditingTutor({ ...editingTutor, name: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Contact</label>
                                <input
                                    type="text"
                                    value={editingTutor?.contact || ""}
                                    onChange={(e) => setEditingTutor({ ...editingTutor, contact: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Courses</label>
                                {courses.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {courses.map((course) => (
                                            <label key={course.id} className="inline-flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCourses.includes(course.id)}
                                                    onChange={() => handleCourseChange(course.id)}
                                                    className="form-checkbox"
                                                />
                                                <span className="ml-2 text-gray-700">{course.courseName}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No courses available.</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded-md"
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
