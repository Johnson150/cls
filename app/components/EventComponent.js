"use client";

import React, { useState, useEffect } from "react";

const EventComponent = ({ event }) => {
  const storedStatus =
    JSON.parse(localStorage.getItem(`bookedOffStatus-${event.id}`)) || {};

  const [bookedOffStudents, setBookedOffStudent] = useState(
    Object.fromEntries(
      event.studentNames.map((student) => [
        student,
        storedStatus[student] || false,
      ]),
    ),
  );

  const bookedOffStudentCount = Object.values(bookedOffStudents).filter(
    (status) => status,
  ).length;

  const totalStudents = event.studentNames.length;

  const currentCapacity = totalStudents - bookedOffStudentCount;

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
