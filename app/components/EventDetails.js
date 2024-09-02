import React, { useState, useEffect } from "react";
import moment from "moment";

const EventDetails = ({ event, onClose, onEdit, onDelete, onSave }) => {
  const storedStatus =
    JSON.parse(localStorage.getItem(`bookedOffStatus-${event.id}`)) || {};
  const storedDescriptions =
    JSON.parse(localStorage.getItem(`bookedOffDescriptions-${event.id}`)) || {};

  const [bookedOffStatus, setBookedOffStatus] = useState(
    event.studentNames.reduce((acc, student) => {
      acc[student] = storedStatus[student] || false;
      return acc;
    }, {}),
  );

  const [bookedOffDescriptions, setBookedOffDescriptions] = useState(
    event.studentNames.reduce((acc, student) => {
      acc[student] = storedDescriptions[student] || "";
      return acc;
    }, {}),
  );

  useEffect(() => {
    localStorage.setItem(
      `bookedOffStatus-${event.id}`,
      JSON.stringify(bookedOffStatus),
    );
    localStorage.setItem(
      `bookedOffDescriptions-${event.id}`,
      JSON.stringify(bookedOffDescriptions),
    );
  }, [bookedOffStatus, bookedOffDescriptions, event.id]);

  const handleClickOutside = (e) => {
    if (e.target.id === "event-details-modal") {
      onClose();
    }
  };

  const toggleBookedOff = (student) => {
    setBookedOffStatus((prevStatus) => ({
      ...prevStatus,
      [student]: !prevStatus[student],
    }));
  };

  const handleDescriptionChange = (student, description) => {
    setBookedOffDescriptions((prevDescriptions) => ({
      ...prevDescriptions,
      [student]: description,
    }));
  };

  const handleSave = () => {
    onSave({ ...event, bookedOffStatus, bookedOffDescriptions });
    onClose();
    window.location.reload();
  };

  const bookedOffCount = Object.values(bookedOffStatus).filter(
    (status) => status,
  ).length;

  const totalStudents = event.studentNames.length;
  const currentCapacity = totalStudents - bookedOffCount;

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
          {event.studentNames.map((student) => (
            <div key={student} style={{ marginBottom: "10px" }}>
              <label>
                <input
                  type="checkbox"
                  checked={bookedOffStatus[student]}
                  onChange={() => toggleBookedOff(student)}
                />
                {bookedOffStatus[student] ? (
                  <span style={{ textDecoration: "line-through" }}>
                    {student}
                  </span>
                ) : (
                  <span>{student}</span>
                )}
              </label>
              {bookedOffStatus[student] && (
                <textarea
                  value={bookedOffDescriptions[student] || ""}
                  onChange={(e) =>
                    handleDescriptionChange(student, e.target.value)
                  }
                  placeholder="Enter description for booking off"
                  style={{
                    display: "block",
                    width: "100%",
                    marginTop: "5px",
                    padding: "5px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                />
              )}
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
          <strong>Students Booked: </strong>
          {currentCapacity} (Booked Off: {bookedOffCount})
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "20px",
          }}
        >
          <button
            onClick={handleSave}
            style={{
              backgroundColor: "#4CAF50",
              color: "white",
              padding: "10px 20px",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Save
          </button>
          <button
            onClick={() => onEdit(event)}
            style={{
              backgroundColor: "#2196F3",
              color: "white",
              padding: "10px 20px",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (
                window.confirm("Are you sure you want to delete this event?")
              ) {
                onDelete(event);
              }
            }}
            style={{
              backgroundColor: "#f44336",
              color: "white",
              padding: "10px 20px",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
