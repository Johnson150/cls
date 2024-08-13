import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

// Function to handle POST requests to create a new TutorScheduledClass entry
// URL: http://localhost:3000/api/tutorScheduledClass
export const POST = async (req) => {
    try {
        const body = await req.json();
        const { tutorId, scheduledClassId } = body;

        const newTutorScheduledClass = await client.tutorScheduledClass.create({
            data: {
                tutor: { connect: { id: tutorId } },
                scheduledClass: { connect: { id: scheduledClassId } }
            },
        });

        return NextResponse.json(newTutorScheduledClass);
    } catch (error) {
        console.error(error); // Error details in the server logs
        return NextResponse.json(
            { message: "Error creating TutorScheduledClass", error: error.message },
            { status: 500 }
        );
    }
};

// Function to handle GET requests to return all TutorScheduledClass entries
// URL: http://localhost:3000/api/tutorScheduledClass
export const GET = async () => {
    try {
        const tutorScheduledClasses = await client.tutorScheduledClass.findMany({
            include: {
                tutor: true, // Include associated tutor
                scheduledClass: true, // Include associated scheduled class
            },
        });

        return NextResponse.json(tutorScheduledClasses);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Error getting TutorScheduledClass entries", error: error.message },
            { status: 500 }
        );
    }
};

// Fetches TutorScheduledClass entries by using the GET function
export const FETCH = async () => {
    return await GET();
};
