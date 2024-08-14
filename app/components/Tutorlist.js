"use client";
import { useState, useEffect } from "react";
import AddTutor from '@/app/components/Addtutor'; // Adjust the import path as necessary

const TutorList = () => {
    const [tutors, setTutors] = useState([]);
    const [error, setError] = useState(null);

    // Fetch the list of tutors from the API
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

    useEffect(() => {
        fetchTutors();
    }, []);

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 border border-gray-200 rounded-lg shadow-md">
            {/* Centered Add Tutor Button */}
            <div className="flex justify-center mb-6">
                <AddTutor refreshTutors={fetchTutors} />
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
                                        <th className="py-2 px-4 border-b">Courses</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tutors.map((tutor) => (
                                        <tr key={tutor.id}>
                                            <td className="py-2 px-4 border-b">{tutor.name}</td>
                                            <td className="py-2 px-4 border-b">{tutor.hoursWorked}</td>
                                            <td className="py-2 px-4 border-b">{tutor.hoursScheduled}</td>
                                            <td className="py-2 px-4 border-b">{tutor.timesBookedOff}</td>
                                            <td className="py-2 px-4 border-b">
                                                {tutor.courses && tutor.courses.length > 0 ? (
                                                    tutor.courses.map((tc, index) => (
                                                        <span key={tc.id} className="text-gray-800">
                                                            {tc.course.courseName}
                                                            {index < tutor.courses.length - 1 && ", "}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-500">No courses assigned</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TutorList;
