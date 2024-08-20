import React from "react";
import moment from "moment";
import { Views } from "react-big-calendar";

const Toolbar = ({ date, view, onNavigate, onViewChange }) => {
  let label;

  switch (view) {
    case Views.MONTH:
      label = moment(date).format("MMMM YYYY");
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

  const years = Array.from(new Array(7), (val, index) =>
    2024 + index
  ); // Array of years from 2024 to 2030

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

  return (
    <div className="relative flex items-center justify-between w-full pr-4">
      <div className="flex space-x-2">
        {(view === Views.MONTH || view === Views.WEEK) && (
          <div className="flex space-x-2">
            <select
              onChange={handleMonthChange}
              value={moment(date).month()}
              className="px-4 py-2 bg-white border border-gray-300 rounded shadow-md"
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
              className="px-4 py-2 bg-white border border-gray-300 rounded shadow-md"
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
                className="px-4 py-2 bg-white border border-gray-300 rounded shadow-md"
              >
                {weeks.map((week, index) => (
                  <option key={index} value={week.value}>
                    {week.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
        {view === Views.DAY && (
          <button
            onClick={toWeek}
            className="px-4 py-2 bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition duration-200 ease-in-out m-1"
          >
            Week View
          </button>
        )}
      </div>
      <div className="absolute text-lg font-bold left-1/2 transform -translate-x-1/2">
        {label}
      </div>
      <div className="flex space-x-2 ml-auto">
        <button
          onClick={toBack}
          className="w-24 px-4 py-2 bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition duration-200 ease-in-out m-1"
        >
          Previous
        </button>
        <button
          onClick={toDay}
          className="px-4 py-2 bg-green-600 text-white font-semibold shadow-md hover:bg-green-700 transition duration-200 ease-in-out m-1"
        >
          Today
        </button>
        <button
          onClick={toNext}
          className="w-24 px-4 py-2 bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition duration-200 ease-in-out m-1"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
