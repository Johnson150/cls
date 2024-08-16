import React from "react";
import Header from "@/app/components/Header";
import StudentList from "@/app/components/Studentlist";
function App() {
    return (
        <div>
            <Header />
            <div className="flex items-center justify-center h-screen">
                <StudentList />
            </div>
        </div>
    );
}

export default App;