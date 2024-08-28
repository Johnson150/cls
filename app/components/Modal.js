import React from "react";

// Overlay modal component with dynamic title
const Modal = ({ children, showModal, setShowModal, title }) => {
  return (
    <>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 rounded-t-lg">
              <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out"
                aria-label="Close modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto max-h-96">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
