import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export const POST = async (req) => {
    try {
        const body = await req.json();
        const { name, subject, hoursWorked, hoursScheduled, studentIds, scheduledClassIds, courseIds } = body;

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
                subject,
                hoursWorked,
                hoursScheduled,
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
            include: {
                students: true, // Include associated students
                scheduledClasses: {
                    include: {
                        scheduledClass: true // Include associated scheduled classes
                    }
                },
                courses: {
                    include: {
                        course: true // Include associated courses
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
