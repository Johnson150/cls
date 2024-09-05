"use client";
import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Toolbar from "@/app/components/Toolbar";
import AddClass from "@/app/components/Addclass";
import EditClass from "@/app/components/EditClass";

const CalendarComponent = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(Views.WEEK);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const [selectedClassTimes, setSelectedClassTimes] = useState({
    startTime: "",
    endTime: "",
  });
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  moment.updateLocale("en", {
    week: {
      dow: 1, // Set week to start on Monday
    },
  });

  const localizer = momentLocalizer(moment);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/scheduledclass");
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      const data = await response.json();
      setEvents(
        data.map((event) => ({
          ...event,
          start: new Date(event.classDatestart),
          end: new Date(event.classDateend),
        })),
      );
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleNavigate = (date) => {
    setCurrentDate(date);
  };

  const handleSelectSlot = (slotInfo) => {
    if (currentView === Views.WEEK || currentView === Views.DAY) {
      const startTime = moment(slotInfo.start).format("YYYY-MM-DDTHH:mm");
      const endTime = moment(slotInfo.start)
        .add(2, "hour")
        .format("YYYY-MM-DDTHH:mm");

      setSelectedClassTimes({ startTime, endTime });
      setShowAddClassModal(true);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowEditClassModal(true);
  };

  const handleUpdateEvent = (updatedEvent) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === updatedEvent.id
          ? {
            ...updatedEvent,
            start: new Date(updatedEvent.classDatestart),
            end: new Date(updatedEvent.classDateend),
          }
          : event,
      ),
    );
  };

  const refreshClasses = (updatedEvent) => {
    if (updatedEvent) {
      handleUpdateEvent(updatedEvent);
    } else {
      fetchEvents();
    }
  };

  const eventPropGetter = (event) => {
    const backgroundColor =
      event.status === "BOOKED_OFF" ? "#6b7280" : "#3b82f6";
    return {
      style: {
        backgroundColor: backgroundColor,
        color: "white",
        padding: "5px",
        borderRadius: "4px",
        fontSize: "12px",
        overflow: "hidden",
      },
    };
  };

  const availableHours = (date) => {
    return {
      min: new Date(date.setHours(16, 0)),
      max: new Date(date.setHours(23, 59)),
    };
  };

  const { min, max } = availableHours(currentDate);

  const EventComponent = ({ event }) => {
    const maxStudentsPerTutor = 4; // Maximum number of students per tutor column
    const maxStudentsPerAdditionalColumn = 5; // Maximum number of students per additional column

    let remainingStudents = [...event.studentNames];

    // Create columns for tutors
    const tutorColumns = event.tutorNames.map((tutorName, index) => {
      // Get up to maxStudentsPerTutor for this tutor
      const displayedStudents = remainingStudents.splice(
        0,
        maxStudentsPerTutor,
      );

      return (
        <div
          key={index}
          style={{ display: "flex", flexDirection: "column", width: "20%" }}
        >
          <div style={{ fontWeight: "bold" }}>
            {tutorName} (
            {event.classMode === "IN_PERSON" ? "In-Person" : "Online"})
          </div>
          <div style={{ marginLeft: "10px" }}>
            {displayedStudents.map((studentName, studentIndex) => (
              <div key={studentIndex} style={{ marginBottom: "2px" }}>
                • {studentName}
              </div>
            ))}
          </div>
        </div>
      );
    });

    // Create columns for additional students
    let additionalColumns = [];
    let currentColumn = [];
    while (remainingStudents.length > 0) {
      const additionalStudents = remainingStudents.splice(
        0,
        maxStudentsPerAdditionalColumn,
      );
      currentColumn.push(
        ...additionalStudents.map((studentName, studentIndex) => (
          <div key={studentIndex} style={{ marginBottom: "2px" }}>
            • {studentName}
          </div>
        )),
      );

      if (currentColumn.length >= maxStudentsPerAdditionalColumn) {
        additionalColumns.push(
          <div
            key={`additional-${additionalColumns.length}`}
            style={{ display: "flex", flexDirection: "column", width: "20%" }}
          >
            <div style={{ fontWeight: "bold" }}>
              {additionalColumns.length === 0 ? "Additional Students" : ""}
            </div>
            <div style={{ marginLeft: "10px" }}>{currentColumn}</div>
          </div>,
        );
        currentColumn = [];
      }
    }

    if (currentColumn.length > 0) {
      additionalColumns.push(
        <div
          key={`additional-${additionalColumns.length}`}
          style={{ display: "flex", flexDirection: "column", width: "20%" }}
        >
          <div style={{ fontWeight: "bold" }}>
            {additionalColumns.length === 0 ? "Additional Students" : ""}
          </div>
          <div style={{ marginLeft: "10px" }}>{currentColumn}</div>
        </div>,
      );
    }

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: "12px",
          overflow: "hidden",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            width: "100%",
          }}
        >
          {[...tutorColumns, ...additionalColumns]}
        </div>
        <div
          style={{
            fontWeight: "bold",
            width: "100%",
            textAlign: "center",
            marginTop: "5px",
            marginBottom: "5px",
          }}
        >
          {event.courseNames.join(", ")}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="flex justify-between w-full">
          <Toolbar
            date={currentDate}
            view={currentView}
            onNavigate={handleNavigate}
            onViewChange={setCurrentView}
            events={events}
          />
        </div>
        <div className="w-full p-4">
          <Calendar
            localizer={localizer}
            view={currentView}
            views={["month", "week", "day"]}
            date={currentDate}
            events={events}
            components={{
              event: EventComponent,
            }}
            style={{ height: "75vh", width: "100%" }}
            toolbar={false}
            onNavigate={handleNavigate}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            selectable
            eventPropGetter={eventPropGetter}
            min={min}
            max={max}
          />
        </div>
        <AddClass
          showModal={showAddClassModal}
          setShowModal={setShowAddClassModal}
          refreshClasses={refreshClasses}
          startTime={selectedClassTimes.startTime}
          endTime={selectedClassTimes.endTime}
        />
        {selectedEvent && (
          <EditClass
            showModal={showEditClassModal}
            setShowModal={setShowEditClassModal}
            refreshClasses={refreshClasses}
            classDetails={selectedEvent}
          />
        )}
      </div>
    </div>
  );
};

export default CalendarComponent;
