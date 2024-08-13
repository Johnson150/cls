import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

// Function to handle POST requests to create a new StudentScheduledClass entry
// URL: http://localhost:3000/api/studentScheduledClass
export const POST = async (req) => {
    try {
        const body = await req.json();
        const { studentId, scheduledClassId } = body;

        const newStudentScheduledClass = await client.studentScheduledClass.create({
            data: {
                student: { connect: { id: studentId } },
                scheduledClass: { connect: { id: scheduledClassId } }
            },
        });

        return NextResponse.json(newStudentScheduledClass);
    } catch (error) {
        console.error("Error creating StudentScheduledClass:", error); // Error details in the server logs
        return NextResponse.json(
            { message: "Error creating StudentScheduledClass", error: error.message },
            { status: 500 }
        );
    }
};

// Function to handle GET requests to return all StudentScheduledClass entries
// URL: http://localhost:3000/api/studentScheduledClass
export const GET = async () => {
    try {
        const studentScheduledClasses = await client.studentScheduledClass.findMany({
            include: {
                student: true, // Include associated student
                scheduledClass: true, // Include associated scheduled class
            },
        });

        return NextResponse.json(studentScheduledClasses);
    } catch (error) {
        console.error("Error getting StudentScheduledClass entries:", error);
        return NextResponse.json(
            { message: "Error getting StudentScheduledClass entries", error: error.message },
            { status: 500 }
        );
    }
};

// Fetches StudentScheduledClass entries by using the GET function
export const FETCH = async () => {
    return await GET();
};
