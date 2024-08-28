const ModeSelection = ({ classMode, setClassMode }) => (
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Class Mode
    </label>
    <select
      value={classMode}
      onChange={(e) => setClassMode(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="IN_PERSON">In Person</option>
      <option value="ONLINE">Online</option>
    </select>
  </div>
);
export default ModeSelection;
