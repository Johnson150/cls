import React from "react";
import Header from "@/app/components/Header";
import CalendarComponent from "@/app/components/Calendar"; // Import the CalendarComponent

export default function Home() {
  return (
    <div>
      <Header />
      <CalendarComponent />
    </div>
  );
}
