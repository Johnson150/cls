"use client";
import React, { useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Toolbar from "@/components/Toolbar";

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());

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

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Toolbar date={currentDate} onNavigate={handleNavigate} />
      <div className="w-full p-4">
        <Calendar
          localizer={localizer}
          defaultView={Views.WEEK}
          view={Views.WEEK}
          date={currentDate}
          style={{ height: "85vh", width: "100%" }}
          toolbar={false}
        />
      </div>
    </div>
  );
}
