import React, { useState, useEffect } from "react";
import Modal from "./Modal";

const AssignStudentToTutorModal = ({ showModal, onClose, students, tutors, onSave }) => {
    const [studentTutorAssignments, setStudentTutorAssignments] = useState({});

    useEffect(() => {
        console.log("Students passed to modal:", students); // Debugging output

        const initialAssignments = {};
        students.forEach((student) => {
            if (student && student.id) {
                initialAssignments[student.id] = ""; // Initialize assignments with student ID
            }
        });
        setStudentTutorAssignments(initialAssignments);
    }, [students]);

    const handleTutorChange = (studentId, tutorId) => {
        setStudentTutorAssignments((prev) => ({
            ...prev,
            [studentId]: tutorId,
        }));
    };

    const handleSave = () => {
        onSave(studentTutorAssignments);
        onClose(); // Close the modal after saving
    };

    return (
        <Modal showModal={showModal} setShowModal={onClose} title="Assign Tutors to Students">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-3xl mx-auto">
                {students.map((student) => (
                    <div key={student.id} className="mb-4">
                        <label className="block font-medium text-gray-700">
                            Assign Tutor for {student.name || `Student ID: ${student.id || "undefined"}`}:
                        </label>
                        <select
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            value={studentTutorAssignments[student.id] || ""}
                            onChange={(e) => handleTutorChange(student.id, e.target.value)}
                        >
                            <option value="">Select a tutor</option>
                            {tutors.map((tutor) => (
                                <option key={tutor.id} value={tutor.id}>
                                    {tutor.name}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
                <button
                    onClick={handleSave}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Save Assignments
                </button>
            </div>
        </Modal>
    );
};

export default AssignStudentToTutorModal;
