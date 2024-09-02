"use client";

import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Toolbar from "@/app/components/Toolbar";
import AddClass from "@/app/components/AddClass";
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
        .add(1, "hour")
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
              ...event,
              bookedOffStatus: updatedEvent.bookedOffStatus, // Save the bookedOffStatus
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
