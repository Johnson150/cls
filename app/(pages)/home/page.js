"use client";
import React, { useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Toolbar from "@/app/components/Toolbar";
import Header from "@/app/components/Header";
import AddClass from "@/app/components/Addclass"; // Import the AddClass component

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(Views.WEEK);
  const [showAddClassModal, setShowAddClassModal] = useState(false); // State to control AddClass modal

  // Set week to start on Monday
  moment.updateLocale("en", {
    week: {
      dow: 1,
    },
  });

  const localizer = momentLocalizer(moment);

  const handleNavigate = (date) => {
    setCurrentDate(date);
  };

  const handleSelectSlot = (slotInfo) => {
    setCurrentDate(slotInfo.start); // Set the clicked date
    setCurrentView(Views.DAY); // Switch to day view
  };

  const refreshClasses = () => {
    // Add logic to refresh classes if needed
  };

  return (
    <div>
      <Header />
      <div className="flex flex-col items-center justify-center h-screen">
        <Toolbar
          date={currentDate}
          view={currentView}
          onNavigate={handleNavigate}
          onViewChange={setCurrentView} // Pass setCurrentView to allow switching views
        />
        <div className="w-full p-4">
          {currentView === Views.DAY && (
            <div className="mb-4 flex justify-end items-center">
              <button
                onClick={() => setShowAddClassModal(true)} // Open AddClass modal
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Schedule Class
              </button>
            </div>
          )}
          <Calendar
            localizer={localizer}
            view={currentView} // Dynamic view based on state
            views={['week', 'day']} // Allow Week and Day views
            date={currentDate}
            style={{ height: "75vh", width: "100%" }}
            toolbar={false} // Disable default toolbar
            onNavigate={handleNavigate}
            onSelectSlot={handleSelectSlot} // Handle day click
            selectable // Allow selection of slots
          />
        </div>
        <AddClass
          showModal={showAddClassModal}
          setShowModal={setShowAddClassModal}
          refreshClasses={refreshClasses}
        />
      </div>
    </div>
  );
}
