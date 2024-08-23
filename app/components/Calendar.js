"use client";
import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Toolbar from "@/app/components/Toolbar";
import AddClass from "@/app/components/Addclass";
import EditClass from "@/app/components/EditClass"; // Import EditClass

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
                }))
            );
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    const handleNavigate = (date) => {
        setCurrentDate(date);
    };

    const handleSelectSlot = (slotInfo) => {
        if (currentView === Views.WEEK) {
            setCurrentDate(slotInfo.start);
            setCurrentView(Views.DAY);
        } else if (currentView === Views.DAY) {
            const startTime = moment(slotInfo.start).format("YYYY-MM-DDTHH:mm");
            setSelectedClassTimes({ startTime });
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
                    : event
            )
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

    const EventComponent = ({ event }) => (
        <div>
            <strong>{event.courseName}</strong>
            <br />
            <span>
                Mode: {event.classMode === "IN_PERSON" ? "In Person" : "Online"}
                <br />
                Tutors: {event.tutorNames.join(", ")}
                <br />
                Students: {event.studentNames.join(", ")}
            </span>
        </div>
    );

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
