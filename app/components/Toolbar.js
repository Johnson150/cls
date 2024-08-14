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

  return (
    <div className="relative flex items-center justify-between w-full pr-4">
      <div className="flex space-x-2">
        <button
          onClick={() => onViewChange(Views.DAY)}
          className={`px-4 py-2 ${
            view === Views.DAY ? "bg-blue-700" : "bg-blue-600"
          } text-white font-semibold shadow-md hover:bg-blue-700 transition duration-200 ease-in-out m-1`}
        >
          Day
        </button>
        <button
          onClick={() => onViewChange(Views.WEEK)}
          className={`px-4 py-2 ${
            view === Views.WEEK ? "bg-blue-700" : "bg-blue-600"
          } text-white font-semibold shadow-md hover:bg-blue-700 transition duration-200 ease-in-out m-1`}
        >
          Week
        </button>
        <button
          onClick={() => onViewChange(Views.MONTH)}
          className={`px-4 py-2 ${
            view === Views.MONTH ? "bg-blue-700" : "bg-blue-600"
          } text-white font-semibold shadow-md hover:bg-blue-700 transition duration-200 ease-in-out m-1`}
        >
          Month
        </button>
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
