"use client"
import React, { useState } from 'react';

const Calendar = () => {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());

    // Function to get the start of the week (Monday)
    const getStartOfWeek = (date) => {
        const start = new Date(date);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        return new Date(start.setDate(diff));
    };

    // Get the current week days
    const startOfWeek = getStartOfWeek(currentDate);
    const weekDays = daysOfWeek.map((day, index) => {
        const dayDate = new Date(startOfWeek);
        dayDate.setDate(startOfWeek.getDate() + index);
        const formattedDate = dayDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

        return {
            day,
            date: formattedDate,
        };
    });

    // Handle navigating to previous week
    const handlePreviousWeek = () => {
        const previousWeek = new Date(currentDate);
        previousWeek.setDate(currentDate.getDate() - 7);
        setCurrentDate(previousWeek);
    };

    // Handle navigating to next week
    const handleNextWeek = () => {
        const nextWeek = new Date(currentDate);
        nextWeek.setDate(currentDate.getDate() + 7);
        setCurrentDate(nextWeek);
    };

    // Handle changing the month
    const handleMonthChange = (event) => {
        const newMonth = parseInt(event.target.value);
        const newDate = new Date(currentDate.getFullYear(), newMonth, 1);
        setCurrentDate(newDate);
        setSelectedMonth(newMonth);
    };

    return (
        <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={handlePreviousWeek}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    &lt; Previous Week
                </button>
                <select
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    className="bg-gray-200 border border-gray-300 p-2 rounded"
                >
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i}>
                            {new Date(currentDate.getFullYear(), i, 1).toLocaleDateString('en-US', { month: 'long' })}
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleNextWeek}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Next Week &gt;
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {weekDays.map((dayInfo, index) => (
                    <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h2 className="text-lg font-semibold text-gray-800">{dayInfo.day}</h2>
                        <p className="text-sm text-gray-600">{dayInfo.date}</p>
                        <div className="mt-2 text-gray-500">No events scheduled</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Calendar;
