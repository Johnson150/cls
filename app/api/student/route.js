import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export const POST = async (req) => {
    try {
        const body = await req.json();
        const { name, subject, hoursin, hoursscheduled, timesbookedoff = 0, contact, tutorIds, scheduledClassIds, courseIds } = body;

        // Verify that all courses exist
        const courseExists = await client.course.findMany({
            where: { id: { in: courseIds } }
        });

        if (courseExists.length !== courseIds.length) {
            throw new Error("One or more selected courses were not found.");
        }

        // Proceed to create the student with the associated courses, tutors, and scheduled classes
        const newStudent = await client.student.create({
            data: {
                name,
                hoursin,
                hoursscheduled,
                timesbookedoff,
                contact,
                tutors: {
                    create: tutorIds.map((tutorId) => ({
                        tutor: { connect: { id: tutorId } }
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

        return NextResponse.json(newStudent);
    } catch (error) {
        console.error("Error creating student:", error.message);
        return NextResponse.json(
            { message: "Error creating student", error: error.message },
            { status: 500 }
        );
    }
};

// Function to handle GET requests to return all students
export const GET = async () => {
    try {
        const students = await client.student.findMany({
            select: {
                id: true,
                name: true,
                hoursin: true,
                hoursscheduled: true,
                timesbookedoff: true,
                contact: true,
                tutors: true, // Include associated tutors
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

        return NextResponse.json(students);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Error getting students", error: error.message },
            { status: 500 }
        );
    }
};
