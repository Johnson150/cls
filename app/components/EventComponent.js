"use client";

import React from "react";

const EventComponent = ({ event }) => {
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
        Students: {event.studentNames.length}/{event.maxCapacity || 4}
      </div>
    </div>
  );
};

export default EventComponent;
