"use client";

import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Toolbar from "@/app/components/Toolbar";
import AddClass from "@/app/components/Addclass";
import EditClass from "@/app/components/EditClass";
import EventDetails from "@/app/components/EventDetails";
import EventComponent from "@/app/components/EventComponent";

const CalendarComponent = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(Views.WEEK);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
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
    setShowEventDetailsModal(true);
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

  const handleEdit = () => {
    setShowEditClassModal(true);
    setShowEventDetailsModal(false);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/scheduledclass/${selectedEvent.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete class");
      }

      setEvents(events.filter((event) => event.id !== selectedEvent.id));
      setShowEventDetailsModal(false);
    } catch (error) {
      console.error("Failed to delete class:", error);
    }
  };

  const hashCode = (str) => {
    if (typeof str !== "string") {
      console.error("Invalid :", str);
      return 0;
    }

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return hash;
  };

  const numberToColor = (number) => {
    const r = (number >> 16) & 0xff;
    const g = (number >> 8) & 0xff;
    const b = number & 0xff;
    return `rgb(${r}, ${g}, ${b})`;
  };

  const bgColor = (courseNames) => {
    const courseString = String(courseNames || "default");
    const hash = hashCode(courseString);
    return numberToColor(hash);
  };

  const eventPropGetter = (event) => {
    return {
      style: {
        backgroundColor: bgColor(event.courseNames),
        color: "white",
        padding: "5px",
        borderRadius: "4px",
        fontSize: "12px",
        overflow: "hidden",
      },
    };
  };

  const calendarStyle = (date) => {
    const day = moment(date).day();
    if (day === 0 || day === 2 || day === 4) {
      return {
        style: {
          backgroundColor: "#FBE5E5",
          color: "black",
        },
      };
    }
  };

  const availableHours = (date) => {
    return {
      min: new Date(date.setHours(16, 0)),
      max: new Date(date.setHours(23, 59)),
    };
  };

  const { min, max } = availableHours(currentDate);

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
            style={{ height: "75vh", width: "100%" }}
            toolbar={false}
            onNavigate={handleNavigate}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            selectable
            eventPropGetter={eventPropGetter}
            min={min}
            max={max}
            components={{ event: EventComponent }}
            dayPropGetter={calendarStyle}
          />
        </div>
        <AddClass
          showModal={showAddClassModal}
          setShowModal={setShowAddClassModal}
          refreshClasses={refreshClasses}
          startTime={selectedClassTimes.startTime}
          endTime={selectedClassTimes.endTime}
        />
        {selectedEvent && showEventDetailsModal && (
          <EventDetails
            event={selectedEvent}
            onClose={() => setShowEventDetailsModal(false)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSave={handleUpdateEvent}
          />
        )}
        {selectedEvent && showEditClassModal && (
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
