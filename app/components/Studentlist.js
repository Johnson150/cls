"use client";
import { useState, useEffect } from "react";
import AddStudent from '@/app/components/Addstudent'; // Assuming AddStudent is in the same directory
import Modal from '@/app/components/Modal';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [error, setError] = useState(null);
    const [courses, setCourses] = useState([]);
    const [editingStudent, setEditingStudent] = useState(null);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);

    const fetchStudents = async () => {
        try {
            const response = await fetch("/api/student");
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
            setError(error.message);
        }
    };

    useEffect(() => {
        fetchStudents();
        fetchCourses();
    }, []);

    const handleDelete = async (studentId) => {
        try {
            const response = await fetch(`/api/student/${studentId}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error("Failed to delete student");
            }
            setStudents(students.filter(student => student.id !== studentId));
        } catch (error) {
            setError(error.message);
        }
    };

    const handleEdit = (student) => {
        setEditingStudent(student);
        const studentCourses = student.courses ? student.courses.map(sc => sc.courseId) : [];
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
                    hoursIn: updatedStudent.hoursIn,
                    hoursScheduled: updatedStudent.hoursScheduled,
                    timesBookedOff: updatedStudent.timesBookedOff,
                    contact: updatedStudent.contact, // Include contact in the request body
                    tutorIds: updatedStudent.tutors ? updatedStudent.tutors.map(t => t.id) : [],
                    scheduledClassIds: updatedStudent.scheduledClasses ? updatedStudent.scheduledClasses.map(sc => sc.id) : [],
                    courseIds: validSelectedCourses.length > 0 ? validSelectedCourses : null, // Only send courseIds if user made a change
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
                <AddStudent refreshStudents={fetchStudents} />
            </div>

            <h2 className="text-2xl font-semibold mb-4 text-center">Students List</h2>

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
                                        <th className="py-2 px-4 border-b">Hours In</th>
                                        <th className="py-2 px-4 border-b">Hours Scheduled</th>
                                        <th className="py-2 px-4 border-b">Times Booked Off</th>
                                        <th className="py-2 px-4 border-b">Contact</th> {/* New Contact Field */}
                                        <th className="py-2 px-4 border-b">Courses</th>
                                        <th className="py-2 px-4 border-b">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student) => (
                                        <tr key={student.id}>
                                            <td className="py-2 px-4 border-b">{student.name}</td>
                                            <td className="py-2 px-4 border-b">{student.hoursIn}</td>
                                            <td className="py-2 px-4 border-b">{student.hoursScheduled}</td>
                                            <td className="py-2 px-4 border-b">{student.timesBookedOff}</td>
                                            <td className="py-2 px-4 border-b">{student.contact}</td> {/* Display Contact */}
                                            <td className="py-2 px-4 border-b">
                                                {student.courses && student.courses.length > 0 ? (
                                                    student.courses.map((sc, index) => (
                                                        <span key={sc.courseId} className="text-gray-800">
                                                            {sc.course ? sc.course.courseName : "Unknown Course"}
                                                            {index < student.courses.length - 1 && ", "}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-500">No courses assigned</span>
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
                                    value={editingStudent.name}
                                    onChange={(e) =>
                                        setEditingStudent({ ...editingStudent, name: e.target.value })
                                    }
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Hours In</label>
                                <input
                                    type="number"
                                    value={editingStudent.hoursIn}
                                    onChange={(e) =>
                                        setEditingStudent({
                                            ...editingStudent,
                                            hoursIn: parseInt(e.target.value),
                                        })
                                    }
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Hours Scheduled</label>
                                <input
                                    type="number"
                                    value={editingStudent.hoursScheduled}
                                    onChange={(e) =>
                                        setEditingStudent({
                                            ...editingStudent,
                                            hoursScheduled: parseInt(e.target.value),
                                        })
                                    }
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Times Booked Off</label>
                                <input
                                    type="number"
                                    value={editingStudent.timesBookedOff}
                                    onChange={(e) =>
                                        setEditingStudent({
                                            ...editingStudent,
                                            timesBookedOff: parseInt(e.target.value),
                                        })
                                    }
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Contact</label>
                                <input
                                    type="text"
                                    value={editingStudent.contact}
                                    onChange={(e) =>
                                        setEditingStudent({ ...editingStudent, contact: e.target.value })
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
                                Update Student
                            </button>
                        </form>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default StudentList;
