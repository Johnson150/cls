"use client";
import { useState, useEffect } from "react";
import AddStudent from '@/app/components/AddStudent';
import Modal from '@/app/components/Modal';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [error, setError] = useState(null);
    const [courses, setCourses] = useState([]);
    const [editingStudent, setEditingStudent] = useState(null);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showArchived, setShowArchived] = useState(false); // State to toggle archived students
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchStudents = async () => {
        try {
            const response = await fetch(`/api/student?includeArchived=${showArchived}`, { cache: "no-cache" });
            if (!response.ok) {
                throw new Error("Failed to fetch students");
            }
            const data = await response.json();
            setStudents(data);
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
            console.error("Error fetching courses:", error.message);
            setError(error.message);
        }
    };

    useEffect(() => {
        fetchStudents();
        fetchCourses();
    }, [refreshKey, showArchived]);  // Re-fetch data when refreshKey or showArchived changes

    const handleDelete = async (studentId) => {
        try {
            const response = await fetch(`/api/student/${studentId}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error("Failed to delete student");
            }
            setRefreshKey((prevKey) => prevKey + 1);  // Increment refreshKey to re-fetch data
        } catch (error) {
            setError(error.message);
        }
    };

    const handleArchiveToggle = async (studentId, currentArchivedStatus) => {
        try {
            const response = await fetch(`/api/student/${studentId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ archived: !currentArchivedStatus }), // Toggle archived status
            });
            if (!response.ok) {
                throw new Error("Failed to update student");
            }
            setRefreshKey((prevKey) => prevKey + 1);  // Increment refreshKey to re-fetch data
        } catch (error) {
            setError(error.message);
        }
    };

    const handleEdit = (student) => {
        setEditingStudent(student);
        const studentCourses = student.courses ? student.courses.map(sc => sc.course.id) : [];
        setSelectedCourses(studentCourses);
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

    const handleUpdate = async (updatedStudent) => {
        try {
            const validSelectedCourses = selectedCourses.filter(courseId => courseId !== null && courseId !== undefined);

            const response = await fetch(`/api/student/${updatedStudent.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: updatedStudent.name,
                    contact: updatedStudent.contact,
                    tutorIds: updatedStudent.tutors ? updatedStudent.tutors.map(t => t.id) : [],
                    scheduledClassIds: updatedStudent.scheduledClasses ? updatedStudent.scheduledClasses.map(sc => sc.id) : [],
                    courseIds: validSelectedCourses,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update student");
            }

            const updatedStudentData = await response.json();
            setStudents(students.map(student => student.id === updatedStudent.id ? updatedStudentData : student));
            setShowEditModal(false);
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 border border-gray-200 rounded-lg shadow-md">
            <div className="flex justify-center mb-6">
                <AddStudent refreshStudents={() => setRefreshKey((prevKey) => prevKey + 1)} />
            </div>

            <h2 className="text-2xl font-semibold mb-4 text-center">
                {showArchived ? "Archive Students List" : "Active Students List"}
            </h2>

            <div className="mb-6 flex justify-between">
                <button
                    onClick={() => setShowArchived(!showArchived)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                >
                    {showArchived ? "Show Active Students" : "Show Archived Students"}
                </button>
            </div>

            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
            {students.length === 0 ? (
                <p className="text-gray-700 text-center">No students available.</p>
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
                                    {students.map((student) => (
                                        <tr key={student.id}>
                                            <td className="py-2 px-4 border-b">{student.name}</td>
                                            <td className="py-2 px-4 border-b">{student.contact}</td>
                                            <td className="py-2 px-4 border-b">
                                                {student.courses && student.courses.length > 0 ? (
                                                    student.courses.map((sc, index) => (
                                                        <span key={sc.course.id} className="text-gray-800">
                                                            {sc.course ? sc.course.courseName : "Unknown Course"}
                                                            {index < student.courses.length - 1 && ", "}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-500">No courses assigned</span>
                                                )}
                                            </td>
                                            <td className="py-2 px-4 border-b">
                                                {student.archived ? (
                                                    <span className="text-red-500">Archived</span>
                                                ) : (
                                                    <span className="text-green-500">Active</span>
                                                )}
                                            </td>
                                            <td className="py-2 px-4 border-b">
                                                <button
                                                    onClick={() => handleEdit(student)}
                                                    className="text-blue-500 hover:text-blue-700 mr-2"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(student.id)}
                                                    className="text-red-500 hover:text-red-700 mr-2"
                                                >
                                                    Delete
                                                </button>
                                                <button
                                                    onClick={() => handleArchiveToggle(student.id, student.archived)}
                                                    className={`hover:text-yellow-700 ${student.archived ? "text-yellow-500" : "text-yellow-500"}`}
                                                >
                                                    {student.archived ? "Unarchive" : "Archive"}
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
                        <h2 className="text-2xl font-semibold mb-6">Edit Student</h2>
                        {error && <p className="text-red-500 mb-4">{error}</p>}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleUpdate(editingStudent);
                            }}
                        >
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    value={editingStudent?.name || ''}
                                    onChange={(e) =>
                                        setEditingStudent({ ...editingStudent, name: e.target.value })
                                    }
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Contact</label>
                                <input
                                    type="text"
                                    value={editingStudent?.contact || ''}
                                    onChange={(e) =>
                                        setEditingStudent({ ...editingStudent, contact: e.target.value })
                                    }
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Courses</label>
                                <div className="mt-2">
                                    {courses.map((course) => (
                                        <div key={course.id} className="flex items-center mb-2">
                                            <input
                                                type="checkbox"
                                                id={`course-${course.id}`}
                                                checked={selectedCourses.includes(course.id)}
                                                onChange={() => handleCourseChange(course.id)}
                                                className="mr-2"
                                            />
                                            <label htmlFor={`course-${course.id}`} className="text-sm text-gray-700">
                                                {course.courseName}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 mr-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default StudentList;
