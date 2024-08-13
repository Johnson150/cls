import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

// Function to handle POST requests to create a new tutor
// URL: http://localhost:3000/api/tutor
export const POST = async (req) => {
    try {
        const body = await req.json();
        const { Name, Subject, Hoursworked, Hoursscheduled, studentIds, scheduledClassIds } = body;

        const newTutor = await client.tutor.create({
            data: {
                Name,
                Subject,
                Hoursworked,
                Hoursscheduled,
                students: {
                    create: studentIds.map((studentId) => ({
                        student: { connect: { id: studentId } }
                    }))
                },
                scheduledClasses: {
                    create: scheduledClassIds.map((scheduledClassId) => ({
                        scheduledClass: { connect: { id: scheduledClassId } }
                    }))
                }
            },
        });

        return NextResponse.json(newTutor);
    } catch (error) {
        console.error(error); // Error details in the server logs
        return NextResponse.json(
            { message: "Error creating tutor", error: error.message },
            { status: 500 }
        );
    }
};

// Function to handle GET requests to return all tutors
// URL: http://localhost:3000/api/tutor
export const GET = async () => {
    try {
        const tutors = await client.tutor.findMany({
            include: {
                students: true, // Include associated students
                scheduledClasses: {
                    include: {
                        scheduledClass: true // Include associated scheduled classes
                    }
                }
            },
        });

        return NextResponse.json(tutors);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Error getting tutors", error: error.message },
            { status: 500 }
        );
    }
};

// Fetches tutors by using the GET function
export const FETCH = async () => {
    return await GET();
};
