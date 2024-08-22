import React from "react";
import moment from "moment";
import { Views } from "react-big-calendar";

const Toolbar = ({ date, view, onNavigate, onViewChange, events }) => {
  let label;

  switch (view) {
    case Views.MONTH:
      const startOfMonth = moment(date).startOf("month");
      const endOfMonth = moment(date).endOf("month");
      label = `${startOfMonth.format("MMMM YYYY")} - ${endOfMonth.format("Do MMM")}`;
      break;
    case Views.WEEK:
      const startOfWeek = moment(date).startOf("week");
      const endOfWeek = moment(date).endOf("week");
      label = `${startOfWeek.format("Do MMM")} - ${endOfWeek.format("Do MMM")}`;
      break;
    case Views.DAY:
      label = moment(date).format("dddd, MMMM Do YYYY");
      break;
    default:
      label = moment(date).format("MMMM YYYY");
  }

  const toBack = () => {
    let newDate;

    switch (view) {
      case Views.MONTH:
        newDate = moment(date).subtract(1, "month").toDate();
        break;
      case Views.WEEK:
        newDate = moment(date).subtract(1, "week").toDate();
        break;
      case Views.DAY:
        newDate = moment(date).subtract(1, "day").toDate();
        break;
      default:
        newDate = date;
    }

    onNavigate(newDate);
  };

  const toNext = () => {
    let newDate;

    switch (view) {
      case Views.MONTH:
        newDate = moment(date).add(1, "month").toDate();
        break;
      case Views.WEEK:
        newDate = moment(date).add(1, "week").toDate();
        break;
      case Views.DAY:
        newDate = moment(date).add(1, "day").toDate();
        break;
      default:
        newDate = date;
    }

    onNavigate(newDate);
  };

  const toDay = () => {
    onNavigate(new Date());
    onViewChange(Views.DAY);
  };

  const toWeek = () => {
    onViewChange(Views.WEEK);
  };

  const toMonth = () => {
    onViewChange(Views.MONTH);
  };

  const handleMonthChange = (event) => {
    const newDate = moment(date).month(event.target.value).toDate();
    onNavigate(newDate);
  };

  const handleYearChange = (event) => {
    const newDate = moment(date).year(event.target.value).toDate();
    onNavigate(newDate);
  };

  const handleWeekChange = (event) => {
    const selectedWeekStart = moment(event.target.value);
    onNavigate(selectedWeekStart.toDate());
  };

  const months = moment.months();

  const years = Array.from(new Array(7), (val, index) => 2024 + index); // Array of years from 2024 to 2030

  const weeks = [];
  const startOfMonth = moment(date).startOf("month").startOf("week");
  const endOfMonth = moment(date).endOf("month").endOf("week");

  let current = startOfMonth.clone();

  while (current.isBefore(endOfMonth)) {
    const startOfWeek = current.clone().startOf("week");
    const endOfWeek = current.clone().endOf("week");

    weeks.push({
      label: `${startOfWeek.format("MMM Do")} - ${endOfWeek.format("MMM Do")}`,
      value: startOfWeek.format(),
    });

    current.add(1, "week");
  }

  const calculateWeeklyHours = (date, events) => {
    return calculateHours(date, Views.WEEK, events);
  };

  const calculateMonthlyHours = (date, events) => {
    const startOfMonth = moment(date).startOf("month");
    const endOfMonth = moment(date).endOf("month");
    return calculateHoursRange(startOfMonth, endOfMonth, events);
  };

  const calculateHours = (date, view, events) => {
    const start =
      view === Views.MONTH
        ? moment(date).startOf("month")
        : moment(date).startOf("week");
    const end =
      view === Views.MONTH
        ? moment(date).endOf("month")
        : moment(date).endOf("week");
    return calculateHoursRange(start, end, events);
  };

  const calculateHoursRange = (start, end, events) => {
    const openHours = {
      Monday: { start: "16:30", end: "20:30" },
      Tuesday: null,
      Wednesday: { start: "16:30", end: "20:30" },
      Thursday: null,
      Friday: { start: "16:30", end: "20:30" },
      Saturday: { start: "12:30", end: "16:30" },
      Sunday: null,
    };

    let totalAvailable = 0;
    let totalUsed = 0;

    let current = start.clone();

    while (current.isSameOrBefore(end, "day")) {
      const dayOfWeek = current.format("dddd");
      const hours = openHours[dayOfWeek];

      if (hours) {
        const start = moment(hours.start, "HH:mm");
        const end = moment(hours.end, "HH:mm");
        const available = moment.duration(end.diff(start)).asHours();
        totalAvailable += available;

        let used = 0;
        events.forEach((event) => {
          const eventStart = moment(event.start);
          const eventEnd = moment(event.end);

          if (eventStart.isSame(current, "day")) {
            used += moment.duration(eventEnd.diff(eventStart)).asHours();
          }
        });

        totalUsed += used;
      }

      current.add(1, "day");
    }

    return {
      available: Math.max(totalAvailable - totalUsed, 0),
      used: totalUsed,
    };
  };

  const weeklyHours = calculateWeeklyHours(date, events);
  const monthlyHours = calculateMonthlyHours(date, events);

  return (
    <div className="relative flex flex-col w-full pr-4">
      <div className="flex justify-start w-full">
        <div className="flex flex-col w-full text-lg font-bold">
          <div classname="text-lg font-bold ">
            Week - Available: {weeklyHours.available.toFixed(2)}{" "}
            {weeklyHours.available === 1 ? "hour" : "hours"} | Booked:{" "}
            {weeklyHours.used.toFixed(2)}{" "}
            {weeklyHours.used === 1 ? "hour" : "hours"}
          </div>
          <div className="text-lg font-bold">
            Month - Available: {monthlyHours.available.toFixed(2)}{" "}
            {monthlyHours.available === 1 ? "hour" : "hours"} | Booked:{" "}
            {monthlyHours.used.toFixed(2)}{" "}
            {monthlyHours.used === 1 ? "hour" : "hours"}
          </div>
        </div>
        <div className="flex justify-end w-full px-4 py-2 ">
          <button
            onClick={toWeek}
            className="m-1 px-3 py-1.5 bg-orange-400 text-white font-semibold shadow-md hover:bg-orange-700 transition duration-200 ease-in-out"
          >
            Week View
          </button>
          <button
            onClick={toMonth}
            className="m-1 px-3 py-1.5 bg-orange-400 text-white font-semibold shadow-md hover:bg-orange-700 transition duration-200 ease-in-out"
          >
            Month View
          </button>
        </div>
      </div>
      <div className="flex justify-end w-full">
        <div className="flex justify-between w-full ">
          <div className="flex">
            <select
              onChange={handleMonthChange}
              value={moment(date).month()}
              className="m-1 px-3 py-1.5 bg-white border border-gray-300 rounded shadow-md"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>
            <select
              onChange={handleYearChange}
              value={moment(date).year()}
              className="m-1 px-3 py-1.5 bg-white border border-gray-300 rounded shadow-md"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            {view === Views.WEEK && (
              <select
                onChange={handleWeekChange}
                value={moment(date).startOf("week").format()}
                className="m-1 px-3 py-1.5 bg-white border border-gray-300 rounded shadow-md"
              >
                {weeks.map((week, index) => (
                  <option key={index} value={week.value}>
                    {week.label}
                  </option>
                ))}
              </select>
            )}
          </div>
          {view === Views.DAY && (
            <div className="text-xl font-bold flex-grow text-center">
              {moment(date).format("dddd, MMMM Do YYYY")}
            </div>
          )}
        </div>
        <button
          onClick={toBack}
          className="m-1 w-24 px-3 py-1.5 bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition duration-200 ease-in-out"
        >
          Previous
        </button>
        <button
          onClick={toDay}
          className="m-1 px-3 py-1.5 bg-green-600 text-white font-semibold shadow-md hover:bg-green-700 transition duration-200 ease-in-out"
        >
          Today
        </button>
        <button
          onClick={toNext}
          className="m-1 w-24 px-3 py-1.5 bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition duration-200 ease-in-out"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
