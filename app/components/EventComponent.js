"use client";

import React, { useState, useEffect } from "react";

const EventComponent = ({ event }) => {
  const [bookedOffStatus, setBookedOffStatus] = useState(() => {
    const storedStatus =
      JSON.parse(localStorage.getItem(`bookedOffStatus-${event.id}`)) || {};
    return storedStatus;
  });

  useEffect(() => {
    // Save to local storage whenever bookedOffStatus changes
    localStorage.setItem(
      `bookedOffStatus-${event.id}`,
      JSON.stringify(bookedOffStatus),
    );
  }, [bookedOffStatus, event.id]);

  const totalStudents = event.studentNames.length; // Total number of students
  const bookedOffCount = Object.values(bookedOffStatus).filter(
    (status) => status,
  ).length; // Calculate booked-off students
  const currentCapacity = totalStudents - bookedOffCount; // Students currently in class

  const handleToggleBookedOff = (student) => {
    setBookedOffStatus((prevStatus) => ({
      ...prevStatus,
      [student]: !prevStatus[student],
    }));
  };

  return (
    <div
      style={{
        padding: "4px 6px",
        borderRadius: "4px",
        backgroundColor: event.status === "BOOKED_OFF" ? "#6b7280" : "#3b82f6",
        color: "#fff",
        fontSize: "12px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ fontWeight: "bold", fontSize: "12px" }}>
        {event.courseNames.join(", ")}
      </div>
      <div style={{ fontSize: "12px", marginTop: "2px" }}>
        Tutor: {event.tutorNames.join(", ")}
      </div>
      <div style={{ fontSize: "12px", marginTop: "2px" }}>
        Students: {currentCapacity}/{event.maxCapacity || 4}
      </div>
    </div>
  );
};

export default EventComponent;
