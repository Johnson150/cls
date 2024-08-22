import { useState, useEffect } from "react";
import Modal from './Modal'; // Assuming Modal is in the same directory
import moment from "moment";

const EditClass = ({ showModal, setShowModal, refreshClasses, classDetails }) => {
    const [formState, setFormState] = useState({
        selectedCourse: classDetails.courseId || "",
        selectedTutors: [],
        selectedStudents: [],
        classDatestart: moment(classDetails.classDatestart).format('YYYY-MM-DDTHH:mm'),
        classDateend: moment(classDetails.classDateend).format('YYYY-MM-DDTHH:mm'),
        status: classDetails.status || 'NOT_BOOKED_OFF',
        bookedOffBy: classDetails.bookedOffBy || 'NONE',
        currentEnrollment: classDetails.studentNames.length || 0,  // Initialize with the correct number
    });

    const [initialState, setInitialState] = useState(formState);
    const [courses, setCourses] = useState([]);
    const [tutors, setTutors] = useState([]);
    const [students, setStudents] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [bookedOffByTutor, setBookedOffByTutor] = useState("");
    const [bookedOffByStudent, setBookedOffByStudent] = useState("");

    useEffect(() => {
        if (classDetails.id) {
            fetchClassDetails(classDetails.id);
        }
    }, [classDetails.id]);

    useEffect(() => {
        if (formState.selectedCourse) {
            setFormState((prevState) => ({
                ...prevState,
                selectedTutors: [],
                selectedStudents: [],
            }));
            fetchTutors(formState.selectedCourse);
            fetchStudents(formState.selectedCourse);
        }
    }, [formState.selectedCourse]);

    const fetchClassDetails = async (scheduledClassId) => {
        try {
            const response = await fetch(`/api/scheduledclass/${scheduledClassId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch class details");
            }
            const data = await response.json();

            const updatedFormState = {
                selectedCourse: data.courseId,
                selectedTutors: data.tutorNames,
                selectedStudents: data.studentNames,
                classDatestart: moment(data.classDatestart).format('YYYY-MM-DDTHH:mm'),
                classDateend: moment(data.classDateend).format('YYYY-MM-DDTHH:mm'),
                status: data.status,
                bookedOffBy: data.bookedOffBy,
                currentEnrollment: data.studentNames.length,  // Ensure correct number on load
            };

            // Split the bookedOffBy into tutor or student
            if (data.bookedOffBy.includes("Tutor:")) {
                setBookedOffByTutor(data.bookedOffBy.replace("Tutor: ", ""));
            } else if (data.bookedOffBy.includes("Student:")) {
                setBookedOffByStudent(data.bookedOffBy.replace("Student: ", ""));
            }

            setFormState(updatedFormState);
            setInitialState(updatedFormState);

            fetchCourses();
        } catch (error) {
            setError("Failed to fetch class details");
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
            setError("Failed to fetch courses");
        }
    };

    const fetchTutors = async (courseId) => {
        try {
            const response = await fetch(`/api/tutor?courseIds=${courseId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch tutors");
            }
            const data = await response.json();
            const eligibleTutors = data.map(tutor => tutor.name);
            setTutors(eligibleTutors);
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
            const eligibleStudents = data.map(student => student.name);
            setStudents(eligibleStudents);
        } catch (error) {
            setError("Failed to fetch students");
            setStudents([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleTutorChange = (tutorName) => {
        setFormState((prevState) => ({
            ...prevState,
            selectedTutors: prevState.selectedTutors.includes(tutorName)
                ? prevState.selectedTutors.filter(name => name !== tutorName)
                : [...prevState.selectedTutors, tutorName],
        }));
    };

    const handleStudentChange = (studentName) => {
        setFormState((prevState) => ({
            ...prevState,
            selectedStudents: prevState.selectedStudents.includes(studentName)
                ? prevState.selectedStudents.filter(name => name !== studentName)
                : [...prevState.selectedStudents, studentName],
        }));
    };

    const handleStatusChange = (e) => {
        const { value } = e.target;
        setFormState((prevState) => ({
            ...prevState,
            status: value,
        }));
    };

    const handleBookedOffByChange = (e) => {
        const { name, checked } = e.target;
        if (checked) {
            if (name === "bookedOffByTutor") {
                setBookedOffByTutor(tutors[0]); // Set the first tutor name as an example
                setBookedOffByStudent("");
            } else if (name === "bookedOffByStudent") {
                setBookedOffByStudent(students[0]); // Set the first student name as an example
                setBookedOffByTutor("");
            }
        } else {
            if (name === "bookedOffByTutor") {
                setBookedOffByTutor("");
            } else if (name === "bookedOffByStudent") {
                setBookedOffByStudent("");
            }
        }
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
                    classDatestart: formState.classDatestart,
                    classDateend: formState.classDateend,
                    status: formState.status,
                    bookedOffBy: bookedOffByTutor ? `Tutor: ${bookedOffByTutor}` : `Student: ${bookedOffByStudent}`,
                    tutorNames: formState.selectedTutors,
                    studentNames: formState.selectedStudents,
                    currentEnrollment: formState.selectedStudents.length,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update class");
            }

            setSuccess("Class updated successfully!");
            if (refreshClasses) refreshClasses();
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
            if (refreshClasses) refreshClasses();
            setTimeout(() => setShowModal(false), 2000);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleClose = () => {
        setFormState(initialState);  // Reset form state to the initial state
        setShowModal(false);  // Close the modal
    };

    return (
        <Modal showModal={showModal} setShowModal={handleClose}>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-6">Edit Class</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {success && <p className="text-green-500 mb-4">{success}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Course</label>
                        <select
                            name="selectedCourse"
                            value={formState.selectedCourse}
                            onChange={handleInputChange}
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
                            Current Enrollment: {formState.currentEnrollment}
                        </label>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Tutors</label>
                        <div className="grid grid-cols-2 gap-2">
                            {tutors.map((tutorName, index) => (
                                <label key={index} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        value={tutorName}
                                        checked={formState.selectedTutors.includes(tutorName)}
                                        onChange={() => handleTutorChange(tutorName)}
                                        className="mr-2"
                                    />
                                    {tutorName}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Students</label>
                        <div className="grid grid-cols-2 gap-2">
                            {students.map((studentName, index) => (
                                <label key={index} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        value={studentName}
                                        checked={formState.selectedStudents.includes(studentName)}
                                        onChange={() => handleStudentChange(studentName)}
                                        className="mr-2"
                                    />
                                    {studentName}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            name="status"
                            value={formState.status}
                            onChange={handleStatusChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="NOT_BOOKED_OFF">Not Booked Off</option>
                            <option value="BOOKED_OFF">Booked Off</option>
                        </select>
                    </div>

                    {formState.status === "BOOKED_OFF" && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Booked Off By:</label>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Tutor</label>
                                    {tutors.map((tutorName, index) => (
                                        <label key={index} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="bookedOffByTutor"
                                                checked={bookedOffByTutor === tutorName}
                                                onChange={handleBookedOffByChange}
                                                className="mr-2"
                                            />
                                            {tutorName}
                                        </label>
                                    ))}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Student</label>
                                    {students.map((studentName, index) => (
                                        <label key={index} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="bookedOffByStudent"
                                                checked={bookedOffByStudent === studentName}
                                                onChange={handleBookedOffByChange}
                                                className="mr-2"
                                            />
                                            {studentName}
                                        </label>
                                    ))}
                                </div>
                            </div>
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
