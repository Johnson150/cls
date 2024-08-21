import { useState, useEffect } from "react";
import Modal from './Modal'; // Assuming Modal is in the same directory
import moment from "moment";

const EditClass = ({ showModal, setShowModal, refreshClasses, classDetails }) => {
    const [courses, setCourses] = useState([]);
    const [tutors, setTutors] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(classDetails.courseId || "");
    const [selectedTutors, setSelectedTutors] = useState(classDetails.tutors.map(t => t.tutorId) || []);
    const [selectedStudents, setSelectedStudents] = useState(classDetails.students.map(s => s.studentId) || []);
    const [classDatestart, setClassDatestart] = useState(moment(classDetails.classDatestart).format('YYYY-MM-DDTHH:mm'));
    const [classDateend, setClassDateend] = useState(moment(classDetails.classDateend).format('YYYY-MM-DDTHH:mm'));
    const [status, setStatus] = useState(classDetails.status || 'NOT_BOOKED_OFF');
    const [bookedOffBy, setBookedOffBy] = useState(classDetails.bookedOffBy || 'NONE');
    const [tutorNames, setTutorNames] = useState([]);
    const [studentNames, setStudentNames] = useState([]);

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            fetchTutors(selectedCourse);
            fetchStudents(selectedCourse);
        }
    }, [selectedCourse]);

    useEffect(() => {
        fetchTutorNames(selectedTutors);
        fetchStudentNames(selectedStudents);
    }, [selectedTutors, selectedStudents]);

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
            const response = await fetch(`/api/tutors?courseIds=${courseId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch tutors");
            }
            const data = await response.json();
            setTutors(data);
        } catch (error) {
            setError(error.message);
        }
    };

    const fetchStudents = async (courseId) => {
        try {
            const response = await fetch(`/api/students?courseId=${courseId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch students");
            }
            const data = await response.json();
            setStudents(data);
        } catch (error) {
            setError(error.message);
        }
    };

    const fetchTutorNames = async (tutorIds) => {
        try {
            const response = await fetch(`/api/tutors?ids=${tutorIds.join(',')}`);
            if (!response.ok) {
                throw new Error("Failed to fetch tutor names");
            }
            const data = await response.json();
            setTutorNames(data);
        } catch (error) {
            setError(error.message);
        }
    };

    const fetchStudentNames = async (studentIds) => {
        try {
            const response = await fetch(`/api/students?ids=${studentIds.join(',')}`);
            if (!response.ok) {
                throw new Error("Failed to fetch student names");
            }
            const data = await response.json();
            setStudentNames(data);
        } catch (error) {
            setError(error.message);
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
            const response = await fetch(`/api/scheduledclass/${classDetails.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    classDatestart,
                    classDateend,
                    status,
                    bookedOffBy,
                    tutorIds: selectedTutors,
                    studentIds: selectedStudents,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update class");
            }

            setSuccess("Class updated successfully!");
            if (refreshClasses) refreshClasses(); // Update the calendar with new classes
            setTimeout(() => setShowModal(false), 2000);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDelete = async () => {
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`/api/scheduledclass/${classDetails.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete class");
            }

            setSuccess("Class deleted successfully!");
            if (refreshClasses) refreshClasses(); // Update the calendar with new classes
            setTimeout(() => setShowModal(false), 2000);
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <Modal showModal={showModal} setShowModal={setShowModal}>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-6">Edit Class</h2>
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
                                            {student.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </>
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

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="NOT_BOOKED_OFF">Not Booked Off</option>
                            <option value="BOOKED_OFF">Booked Off</option>
                        </select>
                    </div>

                    {status === 'BOOKED_OFF' && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Booked Off By</label>
                            <select
                                value={bookedOffBy}
                                onChange={(e) => setBookedOffBy(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="NONE">None</option>
                                <option value="TUTOR">Tutor ({tutorNames.map(t => t.name).join(', ')})</option>
                                <option value="STUDENT">Student ({studentNames.map(s => s.name).join(', ')})</option>
                            </select>
                        </div>
                    )}

                    <div className="flex justify-between">
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
                        >
                            Update Class
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-200"
                        >
                            Delete Class
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default EditClass;
