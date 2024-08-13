import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

// Function to handle POST requests to create a new scheduled class
// URL: http://localhost:3000/api/scheduledClass
export const POST = async (req) => {
    try {
        const body = await req.json();
        const { classDate, duration, status, tutorIds, studentIds } = body;

        const newScheduledClass = await client.scheduledClass.create({
            data: {
                classDate,
                duration,
                status,
                tutors: {
                    create: tutorIds.map((tutorId) => ({
                        tutor: { connect: { id: tutorId } }
                    }))
                },
                students: {
                    create: studentIds.map((studentId) => ({
                        student: { connect: { id: studentId } }
                    }))
                }
            },
        });

        return NextResponse.json(newScheduledClass);
    } catch (error) {
        console.error(error); // Error details in the server logs
        return NextResponse.json(
            { message: "Error creating scheduled class", error: error.message },
            { status: 500 }
        );
    }
};

// Function to handle GET requests to return all scheduled classes
// URL: http://localhost:3000/api/scheduledClass
export const GET = async () => {
    try {
        const scheduledClasses = await client.scheduledClass.findMany({
            include: {
                tutors: {
                    include: {
                        tutor: true // Include associated tutors
                    }
                },
                students: {
                    include: {
                        student: true // Include associated students
                    }
                }
            },
        });

        return NextResponse.json(scheduledClasses);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Error getting scheduled classes", error: error.message },
            { status: 500 }
        );
    }
};

// Fetches scheduled classes by using the GET function
export const FETCH = async () => {
    return await GET();
};
