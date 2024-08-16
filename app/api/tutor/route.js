import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";


export const POST = async (req) => {
    try {
        const body = await req.json();
        const { name, hoursWorked, hoursScheduled, timesBookedOff = 0, contact, studentIds, scheduledClassIds, courseIds } = body;

        // Verify that all courses exist
        const courseExists = await client.course.findMany({
            where: { id: { in: courseIds } }
        });

        if (courseExists.length !== courseIds.length) {
            throw new Error("One or more selected courses were not found.");
        }

        // Proceed to create the tutor with the associated courses
        const newTutor = await client.tutor.create({
            data: {
                name,
                hoursWorked,
                hoursScheduled,
                timesBookedOff,
                contact, // Include contact in the data
                students: {
                    create: studentIds.map((studentId) => ({
                        student: { connect: { id: studentId } }
                    }))
                },
                scheduledClasses: {
                    create: scheduledClassIds.map((scheduledClassId) => ({
                        scheduledClass: { connect: { id: scheduledClassId } }
                    }))
                },
                courses: {
                    create: courseIds.map((courseId) => ({
                        course: { connect: { id: courseId } }
                    }))
                }
            },
        });

        return NextResponse.json(newTutor);
    } catch (error) {
        console.error("Error creating tutor:", error.message);
        return NextResponse.json(
            { message: "Error creating tutor", error: error.message },
            { status: 500 }
        );
    }
};



// Function to handle GET requests to return all tutors
export const GET = async () => {
    try {
        const tutors = await client.tutor.findMany({
            select: {
                id: true,
                name: true,
                hoursWorked: true,
                hoursScheduled: true,
                timesBookedOff: true,
                students: true,
                contact: true,  // Include associated students
                scheduledClasses: {
                    select: {
                        scheduledClass: true // Include only specific fields in scheduledClasses
                    },
                },
                courses: {
                    select: {
                        course: true // Include only specific fields in courses
                    },
                },
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