import React from "react";
import moment from "moment";

const Toolbar = ({ date, onNavigate }) => {
  const startOfWeek = moment(date).startOf("week");
  const endOfWeek = moment(date).endOf("week");

  const toBack = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() - 7);
    onNavigate(newDate);
  };

  const toNext = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + 7);
    onNavigate(newDate);
  };

  const toDay = () => {
    const newDate = new Date();
    onNavigate(newDate);
  };

  const todayLabel = moment().format("MMM D, YYYY");
  const weekRange = `${startOfWeek.format("Do MMM")} - ${endOfWeek.format(
    "Do MMM"
  )}`;

  return (
    <div className="relative flex items-center justify-between w-full pr-4">
      <div className="absolute text-lg font-bold left-1/2 transform -translate-x-1/2">
        {weekRange}
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
          {todayLabel}
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
