"use client";
import React, { useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Toolbar from "@/app/components/Toolbar";
import Header from "@/app/components/Header";

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(Views.WEEK);

  // week start monday
  moment.updateLocale("en", {
    week: {
      dow: 1,
    },
  });

  const localizer = momentLocalizer(moment);

  const handleNavigate = (date) => {
    setCurrentDate(date);
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  return (
    <div>
      <Header />
      <div className="flex flex-col items-center justify-center h-screen">
        <Toolbar
          date={currentDate}
          view={currentView}
          onNavigate={handleNavigate}
          onViewChange={handleViewChange}
        />
        <div className="w-full p-4">
          <Calendar
            localizer={localizer}
            view={currentView}
            date={currentDate}
            style={{ height: "85vh", width: "100%" }}
            toolbar={false}
            onView={handleViewChange}
          />
        </div>
      </div>
    </div>
  );
}
