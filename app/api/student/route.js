import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

// Function to handle POST requests to create a new student
// URL: http://localhost:3000/api/student (assuming this is where you want to handle student-related requests)
export const POST = async (req) => {
    try {
        const body = await req.json();
        const { Name, Subject, Hoursin, Hoursscheduled, tutorId } = body;

        const newStudent = await client.student.create({
            data: {
                Name,
                Subject,
                Hoursin,
                Hoursscheduled,
                tutor: tutorId ? { connect: { id: tutorId } } : undefined,
            },
        });

        return NextResponse.json(newStudent);
    } catch (error) {
        console.error(error); // Error details in the server logs
        return NextResponse.json(
            { message: "Error creating student", error: error.message },
            { status: 500 }
        );
    }
};

// Function to handle GET requests to return all students
// URL: http://localhost:3000/api/student
export const GET = async () => {
    try {
        const students = await client.student.findMany({
            include: {
                tutor: true, // Include associated tutor
                scheduledClasses: {
                    include: {
                        scheduledClass: true, // Include associated scheduled classes
                    },
                },
            },
        });

        return NextResponse.json(students);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Error getting students", error: error.message },
            { status: 500 }
        );
    }
};

// Fetches students by using the GET function
export const FETCH = async () => {
    return await GET();
};
