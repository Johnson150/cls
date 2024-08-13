"use client";
import React, { useState } from 'react';

const Calendar = () => {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const [currentDate, setCurrentDate] = useState(new Date()); // Start with the current day
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
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
        setSelectedMonth(previousWeek.getMonth());
        setSelectedYear(previousWeek.getFullYear());
    };

    // Handle navigating to next week
    const handleNextWeek = () => {
        const nextWeek = new Date(currentDate);
        nextWeek.setDate(currentDate.getDate() + 7);
        setCurrentDate(nextWeek);
        setSelectedMonth(nextWeek.getMonth());
        setSelectedYear(nextWeek.getFullYear());
    };

    // Handle changing the year
    const handleYearChange = (event) => {
        const newYear = parseInt(event.target.value);
        const newDate = new Date(newYear, selectedMonth, currentDate.getDate());
        setCurrentDate(newDate);
        setSelectedYear(newYear);
    };

    // Handle changing the month
    const handleMonthChange = (event) => {
        const newMonth = parseInt(event.target.value);
        const newDate = new Date(selectedYear, newMonth, currentDate.getDate());
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
                <div className="flex space-x-4">
                    <select
                        value={selectedYear}
                        onChange={handleYearChange}
                        className="bg-gray-200 border border-gray-300 p-2 rounded"
                    >
                        {Array.from({ length: 2099 - 2024 + 1 }, (_, i) => (
                            <option key={i} value={2024 + i}>
                                {2024 + i}
                            </option>
                        ))}
                    </select>
                    <select
                        value={selectedMonth}
                        onChange={handleMonthChange}
                        className="bg-gray-200 border border-gray-300 p-2 rounded"
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i} value={i}>
                                {new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={handleNextWeek}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Next Week &gt;
                </button>
            </div>

            <table className="w-full text-center border-collapse">
                <thead>
                    <tr>
                        {weekDays.map((dayInfo, index) => (
                            <th key={index} className="border p-2 bg-gray-200">
                                {dayInfo.day}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        {weekDays.map((dayInfo, index) => (
                            <td key={index} className="border p-4 bg-blue-50">
                                <span className="block text-lg font-semibold text-gray-800">{dayInfo.date}</span>
                                <div className="mt-2 text-gray-500">No events scheduled</div>
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default Calendar;
