const TimeSelection = ({
  classDatestart,
  setClassDatestart,
  classDateend,
  setClassDateend,
}) => (
  <>
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Class Start Time
      </label>
      <input
        type="datetime-local"
        value={classDatestart}
        onChange={(e) => setClassDatestart(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Class End Time
      </label>
      <input
        type="datetime-local"
        value={classDateend}
        onChange={(e) => setClassDateend(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  </>
);

export default TimeSelection;
