import React from "react";


// Overlay modal component, props for better functionality
const Modal = ({ children, showModal, setShowModal }) => {
    return (
        <>
            {showModal && (
                <div className="bg-black/50 fixed inset-0 z-50 overflow-y-auto"> {/* Added overflow-y-auto for overall modal */}
                    <div className="flex justify-center items-center min-h-screen">
                        <div className="relative p-5 bg-gray-800 w-1/2 max-w-4xl mx-auto rounded-lg"> {/* Added max-w-4xl for responsiveness */}
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-0 right-0 text-2xl p-2"
                            >
                                &times;
                            </button>
                            <div className="overflow-y-auto h-96"> {/* Scrollable area with fixed height */}
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Modal;


