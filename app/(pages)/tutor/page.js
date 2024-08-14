import React from "react";
import Header from "@/app/components/Header";
import TutorList from "@/app/components/Tutorlist";
function App() {
    return (
        <div>
            <Header />
            <div className="flex items-center justify-center h-screen">
                <TutorList />
            </div>
        </div>
    );
}

export default App;
