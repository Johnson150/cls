import React, { useState } from "react";
import moment from "moment";

const EventDetails = ({ event, onClose, onEdit, onDelete, onSave }) => {
  // Initialize the bookedOffStatus state using student names
  const [bookedOffStatus, setBookedOffStatus] = useState(
    event.bookedOffStatus || // Load from the event if it exists
      event.studentNames.reduce((acc, student) => {
        acc[student] = false; // Initialize all students as not booked off
        return acc;
      }, {}),
  );

  const handleClickOutside = (e) => {
    if (e.target.id === "event-details-modal") {
      onClose();
    }
  };

  const toggleBookedOff = (student) => {
    setBookedOffStatus((prevStatus) => ({
      ...prevStatus,
      [student]: !prevStatus[student], // Toggle the visual booked off status
    }));
  };

  const handleSave = () => {
    // Save the current bookedOffStatus to the event
    onSave({ ...event, bookedOffStatus });
    onClose(); // Optionally close the modal after saving
  };

  const bookedOffCount = Object.values(bookedOffStatus).filter(
    (status) => status,
  ).length;
  const availableCapacity = event.studentNames.length - bookedOffCount;

  return (
    <div
      id="event-details-modal"
      onClick={handleClickOutside}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "#f7f7f7",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          zIndex: 1001,
          width: "90%",
          maxWidth: "500px",
          border: "1px solid #ccc",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            backgroundColor: "transparent",
            border: "none",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          &#10005;
        </button>

        <div style={{ marginBottom: "10px", fontSize: "14px", color: "#555" }}>
          <strong>Date:</strong> {moment(event.start).format("MMMM Do, YYYY")}
        </div>

        <h2
          style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px" }}
        >
          {event.courseNames.join(", ")}
        </h2>

        <div style={{ marginBottom: "10px" }}>
          <strong>Tutors:</strong>
          {event.tutorNames.map((tutor, index) => (
            <div key={index} style={{ marginLeft: "10px", fontSize: "14px" }}>
              {tutor}
            </div>
          ))}
        </div>

        <div style={{ marginBottom: "10px" }}>
          <strong>Students:</strong>
          {event.studentNames.map((student, index) => (
            <div
              key={index}
              style={{
                marginLeft: "10px",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <input
                type="checkbox"
                checked={bookedOffStatus[student] || false}
                onChange={() => toggleBookedOff(student)}
                style={{ marginRight: "10px" }}
              />
              <span
                style={{
                  textDecoration: bookedOffStatus[student]
                    ? "line-through"
                    : "none",
                  color: bookedOffStatus[student] ? "#ff0000" : "#000000", // Optional: Highlight color
                }}
              >
                {student}
              </span>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: "10px" }}>
          <strong>Time:</strong> {moment(event.start).format("hh:mm A")} -{" "}
          {moment(event.end).format("hh:mm A")}
        </div>

        <div style={{ marginBottom: "10px" }}>
          <strong>Mode:</strong>{" "}
          {event.classMode === "IN_PERSON" ? "In-Person" : "Online"}
        </div>

        <div style={{ marginBottom: "10px" }}>
          <strong>Capacity:</strong> {availableCapacity}/
          {event.maxCapacity || 4}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "20px",
          }}
        >
          <button
            style={{
              padding: "10px 15px",
              backgroundColor: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={onEdit}
          >
            Edit
          </button>
          <button
            style={{
              padding: "10px 15px",
              backgroundColor: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={onDelete}
          >
            Delete
          </button>
          <button
            style={{
              padding: "10px 15px",
              backgroundColor: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
